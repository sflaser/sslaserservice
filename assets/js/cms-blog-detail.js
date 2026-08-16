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

  function upsertMeta(selector, attributes, content) {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement("meta");
      Object.keys(attributes).forEach(function (name) {
        element.setAttribute(name, attributes[name]);
      });
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  }

  function buildPageTitle(value) {
    const suffix = " | Sky Fire Laser";
    const label = String(value || "Resource").replace(/\s+/g, " ").trim();
    const available = 65 - suffix.length;
    const shortened = label.length > available
      ? label.slice(0, available).replace(/\s+\S*$/, "").trim()
      : label;
    return `${shortened}${suffix}`;
  }

  function buildDescription(value) {
    const normalized = String(value || "")
      .replace(/[#*_`>\[\]()]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (normalized.length <= 160) return normalized;
    return `${normalized.slice(0, 157).replace(/\s+\S*$/, "").replace(/[,:;\s]+$/, "")}…`;
  }

  function updateSearchMetadata(post, coverImageUrl) {
    const canonicalUrl = new URL(`${window.location.pathname}?slug=${encodeURIComponent(post.slug)}`, window.location.origin).href;
    const description = buildDescription(post.excerpt || post.content || "");
    const absoluteImageUrl = coverImageUrl
      ? new URL(coverImageUrl, window.location.origin).href
      : "";
    const canonical = document.head.querySelector('link[rel="canonical"]');
    const currentLanguage = (document.documentElement.lang || "en-US").toLowerCase();

    if (canonical) canonical.href = canonicalUrl;
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (link) {
      const language = link.getAttribute("hreflang");
      const counterpartPath = language === "es" ? "/es/blog.html" : "/blog.html";
      link.href = new URL(`${counterpartPath}?slug=${encodeURIComponent(post.slug)}`, window.location.origin).href;
    });

    upsertMeta('meta[name="robots"]', { name: "robots" }, "index,follow,max-image-preview:large,max-snippet:-1");
    upsertMeta('meta[name="description"]', { name: "description" }, description);
    upsertMeta('meta[property="og:title"]', { property: "og:title" }, post.title);
    upsertMeta('meta[property="og:description"]', { property: "og:description" }, description);
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, "article");
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, absoluteImageUrl ? "summary_large_image" : "summary");
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, post.title);
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, description);

    if (absoluteImageUrl) {
      upsertMeta('meta[property="og:image"]', { property: "og:image" }, absoluteImageUrl);
      upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt" }, post.title);
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image" }, absoluteImageUrl);
      upsertMeta('meta[name="twitter:image:alt"]', { name: "twitter:image:alt" }, post.title);
    }

    let structuredData = document.getElementById("blog-post-structured-data") || document.head.querySelector('script[type="application/ld+json"]');
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.type = "application/ld+json";
      document.head.appendChild(structuredData);
    }
    structuredData.id = "blog-post-structured-data";
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": `${canonicalUrl}#article`,
          headline: post.title,
          description,
          url: canonicalUrl,
          image: absoluteImageUrl || undefined,
          datePublished: post.published_at || undefined,
          dateModified: post.published_at || undefined,
          inLanguage: currentLanguage.startsWith("es") ? "es" : "en-US",
          author: { "@id": `${window.location.origin}/#organization` },
          publisher: { "@id": `${window.location.origin}/#organization` },
          mainEntityOfPage: { "@id": `${canonicalUrl}#webpage` },
        },
        {
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: post.title,
          description,
          inLanguage: currentLanguage.startsWith("es") ? "es" : "en-US",
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${window.location.origin}/` },
            { "@type": "ListItem", position: 2, name: "Resources", item: `${window.location.origin}/resources` },
            { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
          ],
        },
      ],
    });
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

  function resolveOptimizedImageUrl(url) {
    const value = String(url || "").trim();
    const imageOverrides = {
      "https://ydbviiswxofxapccpibv.supabase.co/storage/v1/object/public/site-assets/blog/1772769062741-mpcf5ny5um.jpeg":
        "/images/blog/generated/solid-state-laser-repair-custom-solutions-source-grounded-20260509.jpg",
      "https://ydbviiswxofxapccpibv.supabase.co/storage/v1/object/public/site-assets/blog/1772436725435-4uw4yozc5td.jpg":
        "/images/blog/generated/preventive-maintenance-solid-state-lasers-source-grounded-20260509.jpg",
    };

    return imageOverrides[value] || value;
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

      document.title = buildPageTitle(post.title);
      titleEl.textContent = post.title || "";
      dateEl.textContent = formatDate(post.published_at);
      excerptEl.textContent = post.excerpt || "";
      bodyEl.innerHTML = renderStructuredContent(post.content || "");

      const coverImageUrl = resolveOptimizedImageUrl(post.cover_image_url);
      updateSearchMetadata(post, coverImageUrl);

      if (coverImageUrl) {
        coverEl.src = coverImageUrl;
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
