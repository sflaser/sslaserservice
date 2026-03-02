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

  async function fetchPost(slug) {
    const query =
      "blog_posts?select=title,slug,excerpt,content,cover_image_url,published_at,status" +
      `&slug=eq.${encodeURIComponent(slug)}` +
      "&status=eq.published&limit=1";

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

    if (!slug) {
      setState("No blog slug found in URL. Please open this page from the Blog list.", true);
      return;
    }

    try {
      const post = await fetchPost(slug);

      if (!post) {
        setState("Blog post not found or not published.", true);
        return;
      }

      document.title = `${post.title} | Sky Fire Laser`;
      titleEl.textContent = post.title || "";
      dateEl.textContent = formatDate(post.published_at);
      excerptEl.textContent = post.excerpt || "";
      bodyEl.innerHTML = escapeHtml(post.content || "").replace(/\n/g, "<br>");

      if (post.cover_image_url) {
        coverEl.src = post.cover_image_url;
        coverEl.alt = post.title || "Blog cover";
        coverEl.hidden = false;
      } else {
        coverEl.hidden = true;
      }

      stateEl.hidden = true;
      cardEl.hidden = false;
    } catch (err) {
      setState(err instanceof Error ? err.message : "Failed to load blog post.", true);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
