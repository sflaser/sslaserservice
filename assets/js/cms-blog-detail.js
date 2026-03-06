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
    let html = escapeHtml(value);

    // Inline code first so markdown markers inside code are preserved.
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/_(.+?)_/g, "<em>$1</em>");

    return html;
  }

  function renderMultiline(value) {
    return renderTextInline(String(value || "")).replace(/\n/g, "<br>");
  }

  function isHorizontalRule(line) {
    return /^\s*([-*_–—])(?:\s*\1){2,}\s*$/.test(line);
  }

  function isHeading(line) {
    return /^\s*#{1,6}\s+/.test(line);
  }

  function isUnorderedList(line) {
    return /^\s*[-*+•–—]\s+/.test(line);
  }

  function isOrderedList(line) {
    return /^\s*\d+[.)]\s+/.test(line);
  }

  function isBlockquote(line) {
    return /^\s*>\s?/.test(line);
  }

  function renderStructuredContent(content) {
    const normalized = String(content || "").replace(/\r\n/g, "\n").trim();
    if (!normalized) return "";

    const lines = normalized.split("\n");
    const html = [];

    let i = 0;
    while (i < lines.length) {
      const raw = lines[i];
      const line = raw.trim();

      if (!line) {
        i += 1;
        continue;
      }

      if (isHorizontalRule(line)) {
        html.push("<hr>");
        i += 1;
        continue;
      }

      if (isHeading(line)) {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          const level = Math.min(4, match[1].length);
          html.push(`<h${level}>${renderTextInline(match[2].trim())}</h${level}>`);
          i += 1;
          continue;
        }
      }

      if (isUnorderedList(line)) {
        const items = [];
        while (i < lines.length) {
          const next = lines[i].trim();
          if (!next) break;
          if (!isUnorderedList(next)) break;
          items.push(next.replace(/^[-*+•–—]\s+/, ""));
          i += 1;
        }
        html.push(`<ul>${items.map((item) => `<li>${renderTextInline(item)}</li>`).join("")}</ul>`);
        continue;
      }

      if (isOrderedList(line)) {
        const items = [];
        while (i < lines.length) {
          const next = lines[i].trim();
          if (!next) break;
          if (!isOrderedList(next)) break;
          items.push(next.replace(/^\d+[.)]\s+/, ""));
          i += 1;
        }
        html.push(`<ol>${items.map((item) => `<li>${renderTextInline(item)}</li>`).join("")}</ol>`);
        continue;
      }

      if (isBlockquote(line)) {
        const quoteLines = [];
        while (i < lines.length) {
          const next = lines[i].trim();
          if (!next) break;
          if (!isBlockquote(next)) break;
          quoteLines.push(next.replace(/^>\s?/, ""));
          i += 1;
        }
        html.push(`<blockquote>${renderMultiline(quoteLines.join("\n"))}</blockquote>`);
        continue;
      }

      const paragraphLines = [];
      while (i < lines.length) {
        const nextRaw = lines[i];
        const next = nextRaw.trim();
        if (!next) break;
        if (isHeading(next) || isHorizontalRule(next) || isUnorderedList(next) || isOrderedList(next) || isBlockquote(next)) {
          break;
        }
        paragraphLines.push(next);
        i += 1;
      }

      if (paragraphLines.length) {
        html.push(`<p>${renderMultiline(paragraphLines.join("\n"))}</p>`);
      }

      if (i < lines.length && !lines[i].trim()) {
        i += 1;
      }
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
