(function () {
  const cfg = window.CMS_CONFIG || {};
  const supabaseUrl = (cfg.supabaseUrl || "").replace(/\/+$/, "");
  const supabaseAnonKey = cfg.supabaseAnonKey || "";

  const stateEl = document.getElementById("blog-state");
  const cardEl = document.getElementById("blog-detail-card");
  const titleEl = document.getElementById("blog-title");
  const dateEl = document.getElementById("blog-date");
  const excerptEl = document.getElementById("blog-excerpt");
  const bodyEl = document.getElementById("blog-body");
  const coverEl = document.getElementById("blog-cover");
  const coverFrameEl = document.getElementById("blog-cover-frame");

  function setState(message, isError) {
    stateEl.textContent = message;
    stateEl.classList.toggle("blog-error", Boolean(isError));
    stateEl.hidden = false;
    cardEl.hidden = true;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function renderTextInline(value) {
    return escapeHtml(value)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  }

  function renderMultiline(value) {
    return renderTextInline(String(value || "")).replace(/\n/g, "<br>");
  }

  function renderStructuredContent(content) {
    const normalized = String(content || "").replace(/\r\n/g, "\n").trim();
    if (!normalized) return "";

    const blocks = normalized.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
    const html = [];

    for (const block of blocks) {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (!lines.length) continue;

      if (/^#{1,4}\s+/.test(lines[0])) {
        const level = Math.min(4, Math.max(1, (lines[0].match(/^#+/) || ["#"])[0].length));
        const text = lines[0].replace(/^#{1,4}\s+/, "");
        html.push(`<h${level}>${renderTextInline(text)}</h${level}>`);
        if (lines.length > 1) {
          html.push(`<p>${renderMultiline(lines.slice(1).join("\n"))}</p>`);
        }
        continue;
      }

      if (lines.every((line) => /^([-*•])\s+/.test(line))) {
        const listItems = lines
          .map((line) => line.replace(/^([-*•])\s+/, ""))
          .map((line) => `<li>${renderTextInline(line)}</li>`)
          .join("");
        html.push(`<ul>${listItems}</ul>`);
        continue;
      }

      if (lines.every((line) => /^\d+[.)]\s+/.test(line))) {
        const listItems = lines
          .map((line) => line.replace(/^\d+[.)]\s+/, ""))
          .map((line) => `<li>${renderTextInline(line)}</li>`)
          .join("");
        html.push(`<ol>${listItems}</ol>`);
        continue;
      }

      if (/^>\s+/.test(lines[0])) {
        const quoteText = lines.map((line) => line.replace(/^>\s+/, "")).join("\n");
        html.push(`<blockquote>${renderMultiline(quoteText)}</blockquote>`);
        continue;
      }

      html.push(`<p>${renderMultiline(lines.join("\n"))}</p>`);
    }

    return html.join("");
  }

  async function fetchPost(params) {
    const filters = ["status=eq.published", "limit=1"];

    if (params.slug) {
      filters.push(`slug=eq.${encodeURIComponent(params.slug)}`);
    } else if (params.id) {
      filters.push(`id=eq.${encodeURIComponent(params.id)}`);
    } else {
      return null;
    }

    const query =
      "blog_posts?select=id,title,slug,excerpt,content,cover_image_url,published_at,status&" +
      filters.join("&");

    const res = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase error ${res.status}: ${body}`);
    }

    const rows = await res.json();
    return rows[0] || null;
  }

  async function init() {
    if (!supabaseUrl || !supabaseAnonKey) {
      setState("CMS is not configured yet. Please set assets/js/cms-config.js.", true);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const slug = (params.get("slug") || "").trim();
    const id = (params.get("id") || "").trim();

    if (!slug && !id) {
      setState("No blog identifier found in URL. Please open this page from the Blog list.", true);
      return;
    }

    try {
      const post = await fetchPost({ slug, id });

      if (!post) {
        setState("Blog post not found or not published.", true);
        return;
      }

      document.title = `${post.title} | Sky Fire Laser`;
      titleEl.textContent = post.title || "";
      dateEl.textContent = formatDate(post.published_at);
      excerptEl.textContent = post.excerpt || "";
      bodyEl.innerHTML = renderStructuredContent(post.content || "");

      if (post.cover_image_url) {
        coverEl.src = post.cover_image_url;
        coverEl.alt = post.title || "Blog cover";
        coverEl.hidden = false;
        if (coverFrameEl) {
          coverFrameEl.hidden = false;
        }
      } else {
        coverEl.hidden = true;
        if (coverFrameEl) {
          coverFrameEl.hidden = true;
        }
      }

      stateEl.hidden = true;
      cardEl.hidden = false;
    } catch (err) {
      setState(err instanceof Error ? err.message : "Failed to load blog post.", true);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
