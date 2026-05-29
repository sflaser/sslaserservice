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

function getSecretFromRequest(event) {
  const headerSecret = readHeader(event.headers, "x-notify-secret");
  if (headerSecret) return headerSecret;

  const auth = readHeader(event.headers, "authorization");
  const match = String(auth || "").match(/^Bearer\s+(.+)$/i);
  if (match) return match[1];

  const params = event.queryStringParameters || {};
  return params.token || "";
}

function getBody(event) {
  if (!event.body) return {};

  const text = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  return JSON.parse(text);
}

function clean(value) {
  return String(value || "").trim();
}

function stripHtml(value) {
  return clean(value)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveShopifyProductUrl(site, body) {
  const handle = clean(body.handle || body.product?.handle);
  if (!site || !handle) return "";
  return `https://${site.replace(/^https?:\/\//, "").replace(/\/+$/, "")}/products/${encodeURIComponent(handle)}`;
}

function normalizePayload(body) {
  const nestedProduct = body.product || {};
  const nestedOrder = body.order || {};

  const site = clean(body.site || body.store || body.domain || body.shop || "Company site");
  const type = clean(body.type || body.event || body.topic || body.resource || "work");
  const title = clean(
    body.title ||
      nestedProduct.title ||
      nestedOrder.name ||
      body.name ||
      body.subject ||
      "Work update"
  );
  const url = clean(body.url || body.link || body.admin_url || body.online_store_url) || resolveShopifyProductUrl(site, body);
  const summary =
    clean(body.summary || body.excerpt || body.description || body.message) ||
    stripHtml(nestedProduct.body_html || body.body_html).slice(0, 220);
  const status = clean(body.status || nestedProduct.status || body.published_status);
  const actor = clean(body.actor || body.author || body.user || "Codex / automation");

  return { site, type, title, url, summary, status, actor };
}

function buildMarkdown(payload) {
  const labels = {
    blog: "博客发布",
    article: "博客发布",
    product: "商品更新",
    order: "订单通知",
    page: "页面更新",
    task: "工作完成",
    work: "工作通知",
  };

  const heading = labels[payload.type] || "工作通知";
  const lines = [
    `### ${heading}`,
    `**站点**：${payload.site}`,
    `**标题**：${payload.title}`,
  ];

  if (payload.url) lines.push(`**链接**：[打开查看](${payload.url})`);
  if (payload.summary) lines.push(`**摘要**：${payload.summary}`);
  if (payload.status) lines.push(`**状态**：${payload.status}`);
  if (payload.actor) lines.push(`**来源**：${payload.actor}`);
  lines.push(`> 时间：${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`);

  return lines.join("\n\n");
}

async function sendWeCom(content) {
  const webhookUrl = process.env.WECOM_WEBHOOK_URL || "";
  if (!webhookUrl) {
    return { sent: false, skipped: "WECOM_WEBHOOK_URL is not configured." };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      msgtype: "markdown",
      markdown: { content },
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.errcode !== 0) {
    throw new Error(`WeCom notification failed: ${JSON.stringify(body)}`);
  }

  return { sent: true };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed." });
  }

  const expectedSecret = process.env.NOTIFY_INGEST_SECRET || "";
  if (expectedSecret && getSecretFromRequest(event) !== expectedSecret) {
    return json(401, { ok: false, error: "Unauthorized notification request." });
  }

  try {
    const payload = normalizePayload(getBody(event));
    const result = await sendWeCom(buildMarkdown(payload));
    return json(200, { ok: true, ...result });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error instanceof Error ? error.message : "Notification failed.",
    });
  }
};
