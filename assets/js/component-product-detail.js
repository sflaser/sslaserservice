(function () {
  const cfg = window.CMS_CONFIG || {};
  const detailData = window.COMPONENT_PRODUCT_DETAILS || {};
  const params = new URLSearchParams(window.location.search);
  const slug = (params.get('slug') || '').trim();

  const stateEl = document.getElementById('product-detail-state');
  const titleEl = document.getElementById('product-title');
  const categoryEl = document.getElementById('product-category');
  const summaryEl = document.getElementById('product-summary');
  const imageEl = document.getElementById('product-image');
  const imageWrapEl = document.getElementById('product-image-wrap');
  const actionsEl = document.getElementById('product-actions');
  const featuresEl = document.getElementById('product-features');
  const applicationsEl = document.getElementById('product-applications');
  const specsEl = document.getElementById('product-specs');
  const sourceEl = document.getElementById('product-source-note');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setState(message, isError) {
    if (!stateEl) return;
    stateEl.textContent = message || '';
    stateEl.classList.toggle('is-error', Boolean(isError));
    stateEl.hidden = !message;
  }

  function quoteHref(productName) {
    const inquiryBrand = cfg.inquiryBrand || 'SkyFire Laser';
    const inquiryEmail = String(cfg.inquiryEmail || 'sales3@sflaser.net').trim();
    const productUrl = window.location.href;
    const subject = encodeURIComponent(`Quote request: ${productName}`);
    const body = encodeURIComponent(
      [
        `Hello ${inquiryBrand} team,`,
        '',
        `I would like to request pricing and availability for ${productName}.`,
        `Product page: ${productUrl}`,
        '',
        'Please send pricing, lead time, and any configuration details needed for quotation.',
        '',
        'Quantity:',
        'Application:',
        'Company:',
        '',
        'Thank you.',
      ].join('\n')
    );

    return `mailto:${inquiryEmail}?subject=${subject}&body=${body}`;
  }

  function resolveOptimizedImageUrl(url) {
    const value = String(url || '').trim();
    const imageOverrides = {
      '/images/products/passive-components/pump-signal-combiner.png':
        '/images/products/passive-components/pump-signal-combiner-skyfire-retouched.png',
      '/images/products/passive-components/pm-pump-signal-combiner.png':
        '/images/products/passive-components/pm-pump-signal-combiner-skyfire-retouched.png',
      '/images/products/passive-components/20w-inline-isolator.png':
        '/images/products/passive-components/20w-inline-isolator-skyfire-retouched.png',
      '/images/products/passive-components/1w-inline-isolator.png':
        '/images/products/passive-components/1w-inline-isolator-skyfire-retouched.png',
    };

    return imageOverrides[value] || value;
  }

  async function fetchProduct(slugValue) {
    const supabaseUrl = String(cfg.supabaseUrl || '').replace(/\/+$/, '');
    const supabaseAnonKey = cfg.supabaseAnonKey || '';

    if (!supabaseUrl || !supabaseAnonKey || !slugValue) {
      return null;
    }

    const query = [
      'products?select=id,name,slug,short_description,description,price_cents,currency,image_url,purchase_url,brochure_url,status,published_at',
      `slug=eq.${encodeURIComponent(slugValue)}`,
      'status=eq.published',
      'limit=1',
    ].join('&');

    const res = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Product details could not be loaded.');
    }

    const rows = await res.json();
    return rows[0] || null;
  }

  function renderList(el, items) {
    if (!el) return;
    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
    el.innerHTML = safeItems.length
      ? safeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li>Send the product name and application context for technical review.</li>';
  }

  function renderTable(table) {
    const columns = Array.isArray(table.columns) ? table.columns : [];
    const rows = Array.isArray(table.rows) ? table.rows : [];

    return `
      <article class="spec-block">
        <h3>${escapeHtml(table.title || 'Specifications')}</h3>
        <div class="spec-table-wrap">
          <table class="spec-table">
            <thead>
              <tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map((row) => `
                <tr>${columns.map((_, index) => `<td>${escapeHtml(row[index] || '')}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </article>
    `;
  }

  function render(product, detail) {
    const name = product?.name || detail?.title || 'Component product';
    const overview = detail?.overview || product?.description || product?.short_description || '';
    const category = detail?.category || 'Component details';

    document.title = `${name} | SS Laser Service`;
    titleEl.textContent = name;
    categoryEl.textContent = category;
    summaryEl.textContent = overview;

    if (product?.image_url) {
      imageEl.src = resolveOptimizedImageUrl(product.image_url);
      imageEl.alt = name;
      imageWrapEl.hidden = false;
    } else {
      imageWrapEl.hidden = true;
    }

    const brochureAction = product?.brochure_url
      ? `<a class="btn btn-outline" href="${escapeHtml(product.brochure_url)}" target="_blank" rel="noopener">Download Brochure</a>`
      : '';

    actionsEl.innerHTML = `
      <a class="btn btn-primary" href="${escapeHtml(quoteHref(name))}">Ask for Quote</a>
      ${brochureAction}
      <a class="btn btn-outline" href="/components/#product-catalog">Back to Components</a>
    `;

    renderList(featuresEl, detail?.features);
    renderList(applicationsEl, detail?.applications);

    const tables = Array.isArray(detail?.tables) ? detail.tables : [];
    specsEl.innerHTML = tables.length
      ? tables.map(renderTable).join('')
      : '<p class="detail-muted">Send the product name and application context for a configuration review.</p>';

    sourceEl.textContent = 'Specifications are organized from the passive optical components product manual and should be confirmed during quotation.';
    setState('');
  }

  document.addEventListener('DOMContentLoaded', async function () {
    if (!slug) {
      setState('Missing product slug. Please return to the Components catalog.', true);
      return;
    }

    try {
      setState('Loading product details...');
      const [product] = await Promise.all([fetchProduct(slug)]);
      const detail = detailData[slug] || null;

      if (!product && !detail) {
        setState('This product detail page is not available yet.', true);
        return;
      }

      render(product, detail || {});
    } catch (err) {
      const detail = detailData[slug] || null;
      if (detail) {
        render(null, detail);
        return;
      }

      setState(err instanceof Error ? err.message : 'Product details could not be loaded.', true);
    }
  });
})();
