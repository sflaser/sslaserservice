const crypto = require("node:crypto");

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function readHeader(headers, name) {
  const key = Object.keys(headers || {}).find((item) => item.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : "";
}

function getBearerToken(headers) {
  const value = readHeader(headers, "authorization");
  const match = String(value || "").match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function buildBlogUrl(slug) {
  const siteUrl = trimTrailingSlash(process.env.BLOG_SITE_URL || "https://www.sslaserservice.com");
  return `${siteUrl}/blog.html?slug=${encodeURIComponent(slug)}`;
}

function buildMarkdown(post) {
  const lines = [
    "### 新博客已发布",
    `**标题**：${post.title}`,
    `**链接**：[点击阅读](${post.url})`,
  ];

  if (post.excerpt) {
    lines.push(`**摘要**：${post.excerpt}`);
  }

  lines.push(`> 来源：Sky Fire Laser CMS`);
  return lines.join("\n\n");
}

function signDingTalkUrl(webhookUrl, secret) {
  if (!secret) return webhookUrl;

  const timestamp = Date.now().toString();
  const stringToSign = `${timestamp}\n${secret}`;
  const sign = crypto.createHmac("sha256", secret).update(stringToSign).digest("base64");
  const url = new URL(webhookUrl);
  url.searchParams.set("timestamp", timestamp);
  url.searchParams.set("sign", sign);
  return url.toString();
}

async function verifySupabaseUser(token) {
  const supabaseUrl = trimTrailingSlash(process.env.SUPABASE_URL || "");
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in Netlify environment variables.");
  }

  if (!token) return false;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.ok;
}

async function sendDingTalk(post) {
  const webhookUrl = process.env.DINGTALK_WEBHOOK_URL || "";
  const response = await fetch(signDingTalkUrl(webhookUrl, process.env.DINGTALK_SECRET || ""), {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      msgtype: "markdown",
      markdown: {
        title: `新博客：${post.title}`,
        text: buildMarkdown(post),
      },
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.errcode !== 0) {
    throw new Error(`DingTalk notification failed: ${JSON.stringify(body)}`);
  }
}

async function sendWeCom(post) {
  const webhookUrl = process.env.WECOM_WEBHOOK_URL || "";
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      msgtype: "markdown",
      markdown: {
        content: buildMarkdown(post),
      },
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.errcode !== 0) {
    throw new Error(`WeCom notification failed: ${JSON.stringify(body)}`);
  }
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed." });
  }

  const channel = process.env.DINGTALK_WEBHOOK_URL
    ? "dingtalk"
    : process.env.WECOM_WEBHOOK_URL
      ? "wecom"
      : "";

  if (!channel) {
    return json(200, {
      ok: true,
      sent: false,
      skipped: "Team notification webhook is not configured.",
    });
  }

  try {
    const token = getBearerToken(event.headers);
    const isAuthorized = await verifySupabaseUser(token);
    if (!isAuthorized) {
      return json(401, { ok: false, error: "Unauthorized CMS session." });
    }

    const payload = JSON.parse(event.body || "{}");
    if (payload.status !== "published") {
      return json(200, { ok: true, sent: false, skipped: "Blog post is not published." });
    }

    const title = String(payload.title || "").trim();
    const slug = String(payload.slug || "").trim();
    const excerpt = String(payload.excerpt || "").trim();

    if (!title || !slug) {
      return json(400, { ok: false, error: "Missing blog title or slug." });
    }

    const post = {
      title,
      slug,
      excerpt,
      url: buildBlogUrl(slug),
    };

    if (channel === "dingtalk") {
      await sendDingTalk(post);
    } else {
      await sendWeCom(post);
    }

    return json(200, { ok: true, sent: true, channel });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error instanceof Error ? error.message : "Notification failed.",
    });
  }
};
