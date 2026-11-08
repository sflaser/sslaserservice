import { buildPageTitle, buildDescription, formatDate, resolveOptimizedImageUrl, renderStructuredContent } from "./blog-rendering.mjs?v=20261108-review1";

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

    document.querySelectorAll('[data-lang-switch] a').forEach(function (link) {
      const path = new URL(link.href, window.location.origin).pathname.startsWith('/es/')
        ? '/es/blog.html' : '/blog.html';
      link.href = new URL(`${path}?slug=${encodeURIComponent(post.slug)}`, window.location.origin).href;
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
    // The edge response already contains the complete, current article.
    if (cardEl.dataset.serverRendered === "true") return;
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
