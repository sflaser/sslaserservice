(function () {
  const productsGrid = document.getElementById('cms-products-grid');
  const blogsGrid = document.getElementById('cms-blog-grid');
  const productsEmpty = document.getElementById('cms-products-empty');
  const blogsEmpty = document.getElementById('cms-blog-empty');

  if (!productsGrid && !blogsGrid) {
    return;
  }

  const cfg = window.CMS_CONFIG || {};
  const supabaseUrl = (cfg.supabaseUrl || '').replace(/\/+$/, '');
  const supabaseAnonKey = cfg.supabaseAnonKey || '';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatPrice(priceCents, currency) {
    const safeCents = Number(priceCents || 0);
    const safeCurrency = (currency || cfg.defaultCurrency || 'USD').toUpperCase();

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
    }).format(safeCents / 100);
  }

  function formatDate(value) {
    if (!value) return 'Draft';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Draft';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  async function fetchTable(pathAndQuery) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${pathAndQuery}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase error ${res.status}: ${body}`);
    }

    return res.json();
  }

  function showSetupMessage() {
    const message = 'CMS is not configured yet. Please set assets/js/cms-config.js.';

    if (productsEmpty) {
      productsEmpty.classList.remove('cms-hidden');
      productsEmpty.classList.add('cms-error');
      productsEmpty.textContent = message;
    }

    if (blogsEmpty) {
      blogsEmpty.classList.remove('cms-hidden');
      blogsEmpty.classList.add('cms-error');
      blogsEmpty.textContent = message;
    }
  }

  async function loadProducts() {
    if (!productsGrid) return;

    const rows = await fetchTable(
      'products?select=id,name,short_description,price_cents,currency,image_url,purchase_url,published_at,status&status=eq.published&order=published_at.desc.nullslast&limit=8'
    );

    if (!rows.length) {
      if (productsEmpty) {
        productsEmpty.classList.remove('cms-hidden');
        productsEmpty.textContent = 'No published products yet.';
      }
      return;
    }

    productsGrid.innerHTML = rows
      .map((item) => {
        const image = item.image_url
          ? `<div class="cms-card-media"><img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}"></div>`
          : '';

        const buyButton = item.purchase_url
          ? `<a class="cms-btn cms-btn-primary" href="${escapeHtml(item.purchase_url)}" target="_blank" rel="noopener">Buy Now</a>`
          : '<button class="cms-btn cms-btn-outline" type="button" disabled>Purchase Link Pending</button>';

        return `
          <article class="cms-card">
            ${image}
            <div class="cms-card-body">
              <div class="cms-kicker">Product</div>
              <h3 class="cms-card-title">${escapeHtml(item.name)}</h3>
              <div class="cms-price">${formatPrice(item.price_cents, item.currency)}</div>
              <p class="cms-card-text">${escapeHtml(item.short_description || '')}</p>
              <div class="cms-card-actions">${buyButton}</div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  async function loadBlogs() {
    if (!blogsGrid) return;

    const rows = await fetchTable(
      'blog_posts?select=id,title,slug,excerpt,content,cover_image_url,published_at,status&status=eq.published&order=published_at.desc.nullslast&limit=6'
    );

    if (!rows.length) {
      if (blogsEmpty) {
        blogsEmpty.classList.remove('cms-hidden');
        blogsEmpty.textContent = 'No published blog posts yet.';
      }
      return;
    }

    blogsGrid.innerHTML = rows
      .map((post) => {
        const image = post.cover_image_url
          ? `<div class="cms-card-media"><img src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.title)}"></div>`
          : '';

        const excerpt = post.excerpt || (post.content || '').slice(0, 180);
        const detailsHref = post.slug
          ? `/blog.html?slug=${encodeURIComponent(post.slug)}`
          : '';
        const coverLink = detailsHref
          ? `<a class="cms-card-cover-link" href="${detailsHref}" aria-label="Read blog post: ${escapeHtml(post.title)}"></a>`
          : '';
        const actionButton = detailsHref
          ? `<a class="cms-btn cms-btn-outline" href="${detailsHref}">Read More</a>`
          : '<button class="cms-btn cms-btn-outline" type="button" disabled>Read More</button>';

        return `
          <article class="cms-card cms-card-link">
            ${coverLink}
            ${image}
            <div class="cms-card-body">
              <div class="cms-kicker">Resource</div>
              <div class="cms-meta">${formatDate(post.published_at)}</div>
              <h3 class="cms-card-title">${escapeHtml(post.title)}</h3>
              <p class="cms-card-text">${escapeHtml(excerpt)}</p>
              <div class="cms-card-actions">
                ${actionButton}
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  document.addEventListener('DOMContentLoaded', async function () {
    if (!supabaseUrl || !supabaseAnonKey) {
      showSetupMessage();
      return;
    }

    try {
      await Promise.all([loadProducts(), loadBlogs()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load CMS content.';

      if (productsEmpty) {
        productsEmpty.classList.remove('cms-hidden');
        productsEmpty.classList.add('cms-error');
        productsEmpty.textContent = message;
      }

      if (blogsEmpty) {
        blogsEmpty.classList.remove('cms-hidden');
        blogsEmpty.classList.add('cms-error');
        blogsEmpty.textContent = message;
      }
    }
  });
})();
