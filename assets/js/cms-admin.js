(function () {
  const cfg = window.CMS_CONFIG || {};
  const supabaseUrl = (cfg.supabaseUrl || '').replace(/\/+$/, '');
  const supabaseAnonKey = cfg.supabaseAnonKey || '';
  const storageBucket = cfg.storageBucket || 'site-assets';

  const loginCard = document.getElementById('login-card');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const statusEl = document.getElementById('admin-status');

  const blogForm = document.getElementById('blog-form');
  const productForm = document.getElementById('product-form');
  const blogsTableBody = document.getElementById('blogs-table-body');
  const productsTableBody = document.getElementById('products-table-body');
  const blogCancelEditBtn = document.getElementById('blog-cancel-edit');
  const productCancelEditBtn = document.getElementById('product-cancel-edit');
  const blogSubmitBtn = blogForm ? blogForm.querySelector('button[type="submit"]') : null;
  const productSubmitBtn = productForm ? productForm.querySelector('button[type="submit"]') : null;
  const blogMarkdownFileInput = document.getElementById('blog-markdown-file');
  const blogImportMdBtn = document.getElementById('blog-import-md');

  const tokenKey = 'cms_admin_access_token';
  let accessToken = localStorage.getItem(tokenKey) || '';
  let editingBlogId = null;
  let editingProductId = null;
  let editingBlogCoverImageUrl = '';
  let editingProductImageUrl = '';
  let blogRowsById = new Map();
  let productRowsById = new Map();

  function setStatus(message, kind) {
    statusEl.textContent = message || '';
    statusEl.className = 'status';
    if (kind) {
      statusEl.classList.add(kind);
    }
  }

  function ensureConfigured() {
    if (!supabaseUrl || !supabaseAnonKey) {
      setStatus('Please configure assets/js/cms-config.js first.', 'error');
      return false;
    }
    return true;
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function parseFrontMatter(markdown) {
    const text = String(markdown || '');
    const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (!match) {
      return { meta: {}, body: text };
    }

    const meta = {};
    const lines = match[1].split('\n');
    for (const line of lines) {
      const kv = line.match(/^\s*([a-zA-Z0-9_-]+)\s*:\s*(.+?)\s*$/);
      if (!kv) continue;
      const key = kv[1].toLowerCase();
      const value = kv[2].replace(/^["']|["']$/g, '');
      meta[key] = value;
    }

    return {
      meta,
      body: text.slice(match[0].length),
    };
  }

  function stripMarkdownToText(markdown) {
    return String(markdown || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^>\s?/gm, '')
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+[.)]\s+/gm, '')
      .replace(/[*_~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseMarkdownDocument(markdown) {
    const normalized = String(markdown || '').replace(/\r\n/g, '\n');
    const parsed = parseFrontMatter(normalized);
    let content = parsed.body.trim();
    const meta = parsed.meta || {};

    let title = String(meta.title || '').trim();
    const firstH1 = content.match(/^#\s+(.+?)\s*$/m);
    if (!title && firstH1) {
      title = firstH1[1].trim();
      content = content.replace(/^#\s+.+?\n+/, '').trim();
    }

    let excerpt = String(meta.excerpt || meta.description || '').trim();
    if (!excerpt) {
      const parts = content.split(/\n{2,}/).map((s) => stripMarkdownToText(s)).filter(Boolean);
      excerpt = parts[0] || '';
      if (excerpt.length > 220) {
        excerpt = `${excerpt.slice(0, 217)}...`;
      }
    }

    const slug = String(meta.slug || '').trim();
    const status = String(meta.status || '').trim().toLowerCase();

    return {
      title,
      slug,
      excerpt,
      content,
      status: status === 'published' ? 'published' : status === 'draft' ? 'draft' : '',
    };
  }

  async function importMarkdownFile(file) {
    if (!(file instanceof File)) {
      throw new Error('Please select a Markdown file first.');
    }
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!['md', 'markdown', 'txt'].includes(ext)) {
      throw new Error('Only .md / .markdown / .txt files are supported.');
    }

    const text = await file.text();
    const parsed = parseMarkdownDocument(text);

    if (!parsed.content) {
      throw new Error('Markdown file is empty.');
    }

    if (parsed.title) {
      blogForm.elements.title.value = parsed.title;
    }
    if (parsed.slug) {
      blogForm.elements.slug.value = parsed.slug;
    } else if (!String(blogForm.elements.slug.value || '').trim() && parsed.title) {
      blogForm.elements.slug.value = slugify(parsed.title);
    }
    if (parsed.excerpt) {
      blogForm.elements.excerpt.value = parsed.excerpt;
    }
    blogForm.elements.content.value = parsed.content;
    if (parsed.status) {
      blogForm.elements.status.value = parsed.status;
    }

    setStatus('Markdown imported. Review and click Save Blog Post.', 'success');
  }

  function setTextareaSelection(textarea, start, end, insertedText, selectedStart, selectedEnd) {
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    textarea.value = `${before}${insertedText}${after}`;

    const nextStart = start + selectedStart;
    const nextEnd = start + selectedEnd;
    textarea.focus();
    textarea.setSelectionRange(nextStart, nextEnd);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function normalizeLinePrefix(text, regex, prefixBuilder) {
    const lines = text.split('\n');
    return lines
      .map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        return `${prefixBuilder(idx)}${trimmed.replace(regex, '')}`;
      })
      .join('\n');
  }

  function applyFormatting(textarea, action) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);

    if (action === 'paragraph') {
      setTextareaSelection(textarea, start, end, '\n\n', 2, 2);
      return;
    }

    if (action === 'bold') {
      if (selected) {
        const text = `**${selected}**`;
        setTextareaSelection(textarea, start, end, text, text.length, text.length);
      } else {
        const placeholder = 'bold text';
        const text = `**${placeholder}**`;
        setTextareaSelection(textarea, start, end, text, 2, 2 + placeholder.length);
      }
      return;
    }

    if (action === 'h2' || action === 'h3') {
      const marker = action === 'h2' ? '##' : '###';
      if (selected) {
        const converted = normalizeLinePrefix(selected, /^#{1,6}\s+/, () => `${marker} `);
        setTextareaSelection(textarea, start, end, converted, converted.length, converted.length);
      } else {
        const placeholder = action === 'h2' ? 'Section Heading' : 'Subheading';
        const text = `${marker} ${placeholder}\n\n`;
        const offset = marker.length + 1;
        setTextareaSelection(textarea, start, end, text, offset, offset + placeholder.length);
      }
      return;
    }

    if (action === 'bullet') {
      if (selected) {
        const converted = normalizeLinePrefix(selected, /^([-*•]|\d+[.)])\s+/, () => '- ');
        setTextareaSelection(textarea, start, end, converted, converted.length, converted.length);
      } else {
        const text = '- List item\n- List item\n';
        setTextareaSelection(textarea, start, end, text, 2, 11);
      }
      return;
    }

    if (action === 'number') {
      if (selected) {
        const converted = normalizeLinePrefix(selected, /^([-*•]|\d+[.)])\s+/, (idx) => `${idx + 1}. `);
        setTextareaSelection(textarea, start, end, converted, converted.length, converted.length);
      } else {
        const text = '1. First item\n2. Second item\n';
        setTextareaSelection(textarea, start, end, text, 3, 13);
      }
      return;
    }

    if (action === 'quote') {
      if (selected) {
        const converted = normalizeLinePrefix(selected, /^>\s+/, () => '> ');
        setTextareaSelection(textarea, start, end, converted, converted.length, converted.length);
      } else {
        const text = '> Quote\n\n';
        setTextareaSelection(textarea, start, end, text, 2, 7);
      }
      return;
    }

    if (action === 'template') {
      const block = [
        '## Overview',
        'One-sentence summary of this topic.',
        '',
        '## Key Points',
        '- Point 1',
        '- Point 2',
        '- Point 3',
        '',
        '## Practical Notes',
        'Write your practical recommendations here.',
        '',
        '## Conclusion',
        'Close with a clear result or next action.',
      ].join('\n');
      const prefix = start > 0 && !/\n$/.test(textarea.value.slice(0, start)) ? '\n\n' : '';
      const text = `${prefix}${block}\n`;
      const selectionStart = prefix.length;
      const selectionEnd = prefix.length + 10;
      setTextareaSelection(textarea, start, end, text, selectionStart, selectionEnd);
    }
  }

  function setBlogEditMode(row) {
    if (!row) return;

    editingBlogId = row.id;
    editingBlogCoverImageUrl = row.cover_image_url || '';
    blogForm.elements.title.value = row.title || '';
    blogForm.elements.slug.value = row.slug || '';
    blogForm.elements.excerpt.value = row.excerpt || '';
    blogForm.elements.content.value = row.content || '';
    blogForm.elements.status.value = row.status || 'draft';

    if (blogSubmitBtn) {
      blogSubmitBtn.textContent = 'Update Blog Post';
    }
    if (blogCancelEditBtn) {
      blogCancelEditBtn.classList.remove('hidden');
    }

    blogForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setStatus(`Editing blog post #${row.id}.`, 'success');
  }

  function clearBlogEditMode(resetForm) {
    editingBlogId = null;
    editingBlogCoverImageUrl = '';
    if (resetForm) {
      blogForm.reset();
      if (blogMarkdownFileInput) {
        blogMarkdownFileInput.value = '';
      }
    }
    blogForm.elements.status.value = 'draft';

    if (blogSubmitBtn) {
      blogSubmitBtn.textContent = 'Save Blog Post';
    }
    if (blogCancelEditBtn) {
      blogCancelEditBtn.classList.add('hidden');
    }
  }

  function setProductEditMode(row) {
    if (!row) return;

    editingProductId = row.id;
    editingProductImageUrl = row.image_url || '';
    productForm.elements.name.value = row.name || '';
    productForm.elements.slug.value = row.slug || '';
    productForm.elements.short_description.value = row.short_description || '';
    productForm.elements.description.value = row.description || '';
    productForm.elements.price.value = (Number(row.price_cents || 0) / 100).toFixed(2);
    productForm.elements.currency.value = (row.currency || 'USD').toUpperCase();
    productForm.elements.purchase_url.value = row.purchase_url || '';
    productForm.elements.status.value = row.status || 'draft';

    if (productSubmitBtn) {
      productSubmitBtn.textContent = 'Update Product';
    }
    if (productCancelEditBtn) {
      productCancelEditBtn.classList.remove('hidden');
    }

    productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setStatus(`Editing product #${row.id}.`, 'success');
  }

  function clearProductEditMode(resetForm) {
    editingProductId = null;
    editingProductImageUrl = '';
    if (resetForm) {
      productForm.reset();
    }
    productForm.elements.currency.value = cfg.defaultCurrency || 'USD';
    productForm.elements.status.value = 'draft';

    if (productSubmitBtn) {
      productSubmitBtn.textContent = 'Save Product';
    }
    if (productCancelEditBtn) {
      productCancelEditBtn.classList.add('hidden');
    }
  }

  async function request(path, options) {
    const method = (options && options.method) || 'GET';
    const body = options && options.body;
    const auth = options && options.auth;

    const headers = {
      apikey: supabaseAnonKey,
      Accept: 'application/json',
    };

    if (auth && accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${supabaseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }

    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      return res.json();
    }

    return null;
  }

  async function uploadImage(file, folder) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const res = await fetch(`${supabaseUrl}/storage/v1/object/${storageBucket}/${key}`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        'x-upsert': 'true',
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Upload failed: ${txt}`);
    }

    return `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${key}`;
  }

  async function login(email, password) {
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Login failed: ${txt}`);
    }

    const data = await res.json();
    accessToken = data.access_token;
    localStorage.setItem(tokenKey, accessToken);
  }

  async function fetchBlogs() {
    const rows = await request(
      '/rest/v1/blog_posts?select=id,title,slug,excerpt,content,cover_image_url,status,published_at,created_at&order=created_at.desc',
      { auth: true }
    );

    blogRowsById = new Map(rows.map((row) => [String(row.id), row]));
    blogsTableBody.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>${row.id}</td>
            <td>${row.title}</td>
            <td><span class="badge ${row.status}">${row.status}</span></td>
            <td>${row.published_at ? new Date(row.published_at).toLocaleString() : '-'}</td>
            <td class="actions">
              <button class="btn btn-outline btn-sm" data-edit-blog="${row.id}">Edit</button>
              <button class="btn btn-danger btn-sm" data-delete-blog="${row.id}">Delete</button>
            </td>
          </tr>
        `
      )
      .join('');
  }

  async function fetchProducts() {
    const rows = await request(
      '/rest/v1/products?select=id,name,slug,short_description,description,price_cents,currency,purchase_url,image_url,status,published_at,created_at&order=created_at.desc',
      { auth: true }
    );

    productRowsById = new Map(rows.map((row) => [String(row.id), row]));
    productsTableBody.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>${row.id}</td>
            <td>${row.name}</td>
            <td>${(Number(row.price_cents || 0) / 100).toFixed(2)} ${(row.currency || 'USD').toUpperCase()}</td>
            <td><span class="badge ${row.status}">${row.status}</span></td>
            <td class="actions">
              <button class="btn btn-outline btn-sm" data-edit-product="${row.id}">Edit</button>
              <button class="btn btn-danger btn-sm" data-delete-product="${row.id}">Delete</button>
            </td>
          </tr>
        `
      )
      .join('');
  }

  async function refreshTables() {
    await Promise.all([fetchBlogs(), fetchProducts()]);
  }

  function enterDashboard() {
    loginCard.classList.add('hidden');
    dashboard.classList.remove('hidden');
  }

  function leaveDashboard() {
    loginCard.classList.remove('hidden');
    dashboard.classList.add('hidden');
  }

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!ensureConfigured()) return;

    const formData = new FormData(loginForm);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    try {
      setStatus('Signing in...');
      await login(email, password);
      enterDashboard();
      await refreshTables();
      setStatus('Signed in successfully.', 'success');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Login failed.', 'error');
    }
  });

  logoutBtn.addEventListener('click', function () {
    accessToken = '';
    localStorage.removeItem(tokenKey);
    clearBlogEditMode(true);
    clearProductEditMode(true);
    leaveDashboard();
    setStatus('Signed out.');
  });

  blogForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    try {
      const formData = new FormData(blogForm);
      const title = String(formData.get('title') || '').trim();
      const slugInput = String(formData.get('slug') || '').trim();
      const slug = slugInput || slugify(title);
      const excerpt = String(formData.get('excerpt') || '').trim();
      const content = String(formData.get('content') || '').trim();
      const status = String(formData.get('status') || 'draft');

      let coverImageUrl = editingBlogCoverImageUrl || null;
      const imageFile = formData.get('cover_image');
      if (imageFile instanceof File && imageFile.size > 0) {
        setStatus('Uploading blog cover image...');
        coverImageUrl = await uploadImage(imageFile, 'blog');
      }

      let publishedAt = null;
      if (status === 'published') {
        const existingRow = editingBlogId ? blogRowsById.get(String(editingBlogId)) : null;
        publishedAt = existingRow && existingRow.published_at ? existingRow.published_at : new Date().toISOString();
      }

      const payload = {
        title,
        slug,
        excerpt,
        content,
        cover_image_url: coverImageUrl,
        status,
        published_at: publishedAt,
      };

      if (editingBlogId) {
        await request(`/rest/v1/blog_posts?id=eq.${encodeURIComponent(editingBlogId)}`, {
          method: 'PATCH',
          auth: true,
          body: payload,
        });
        clearBlogEditMode(true);
        await fetchBlogs();
        setStatus('Blog post updated.', 'success');
      } else {
        await request('/rest/v1/blog_posts', {
          method: 'POST',
          auth: true,
          body: payload,
        });
        clearBlogEditMode(true);
        await fetchBlogs();
        setStatus('Blog post saved.', 'success');
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to save blog post.', 'error');
    }
  });

  productForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    try {
      const formData = new FormData(productForm);
      const name = String(formData.get('name') || '').trim();
      const slugInput = String(formData.get('slug') || '').trim();
      const slug = slugInput || slugify(name);
      const shortDescription = String(formData.get('short_description') || '').trim();
      const description = String(formData.get('description') || '').trim();
      const price = Number(formData.get('price') || 0);
      const currency = String(formData.get('currency') || 'USD').toUpperCase();
      const purchaseUrl = String(formData.get('purchase_url') || '').trim();
      const status = String(formData.get('status') || 'draft');

      let imageUrl = editingProductImageUrl || null;
      const imageFile = formData.get('image');
      if (imageFile instanceof File && imageFile.size > 0) {
        setStatus('Uploading product image...');
        imageUrl = await uploadImage(imageFile, 'products');
      }

      let publishedAt = null;
      if (status === 'published') {
        const existingRow = editingProductId ? productRowsById.get(String(editingProductId)) : null;
        publishedAt = existingRow && existingRow.published_at ? existingRow.published_at : new Date().toISOString();
      }

      const payload = {
        name,
        slug,
        short_description: shortDescription,
        description,
        price_cents: Math.round(price * 100),
        currency,
        purchase_url: purchaseUrl,
        image_url: imageUrl,
        status,
        published_at: publishedAt,
      };

      if (editingProductId) {
        await request(`/rest/v1/products?id=eq.${encodeURIComponent(editingProductId)}`, {
          method: 'PATCH',
          auth: true,
          body: payload,
        });
        clearProductEditMode(true);
        await fetchProducts();
        setStatus('Product updated.', 'success');
      } else {
        await request('/rest/v1/products', {
          method: 'POST',
          auth: true,
          body: payload,
        });
        clearProductEditMode(true);
        await fetchProducts();
        setStatus('Product saved.', 'success');
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to save product.', 'error');
    }
  });

  if (blogCancelEditBtn) {
    blogCancelEditBtn.addEventListener('click', function () {
      clearBlogEditMode(true);
      setStatus('Blog edit cancelled.');
    });
  }

  if (productCancelEditBtn) {
    productCancelEditBtn.addEventListener('click', function () {
      clearProductEditMode(true);
      setStatus('Product edit cancelled.');
    });
  }

  if (blogImportMdBtn) {
    blogImportMdBtn.addEventListener('click', async function () {
      try {
        const file = blogMarkdownFileInput && blogMarkdownFileInput.files ? blogMarkdownFileInput.files[0] : null;
        await importMarkdownFile(file);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Failed to import markdown.', 'error');
      }
    });
  }

  if (blogMarkdownFileInput) {
    blogMarkdownFileInput.addEventListener('change', async function () {
      const file = blogMarkdownFileInput.files ? blogMarkdownFileInput.files[0] : null;
      if (!file) return;

      try {
        await importMarkdownFile(file);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Failed to import markdown.', 'error');
      }
    });
  }

  document.addEventListener('click', async function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const formatBtn = target.closest('[data-format-action][data-format-target]');
    if (formatBtn instanceof HTMLElement) {
      const action = formatBtn.getAttribute('data-format-action');
      const targetId = formatBtn.getAttribute('data-format-target');
      if (action && targetId) {
        const textarea = document.getElementById(targetId);
        if (textarea instanceof HTMLTextAreaElement) {
          applyFormatting(textarea, action);
        }
      }
      return;
    }

    const editBlogId = target.getAttribute('data-edit-blog');
    if (editBlogId) {
      const row = blogRowsById.get(editBlogId);
      if (row) {
        setBlogEditMode(row);
      }
      return;
    }

    const editProductId = target.getAttribute('data-edit-product');
    if (editProductId) {
      const row = productRowsById.get(editProductId);
      if (row) {
        setProductEditMode(row);
      }
      return;
    }

    const blogId = target.getAttribute('data-delete-blog');
    if (blogId) {
      if (!window.confirm('Delete this blog post?')) return;
      try {
        await request(`/rest/v1/blog_posts?id=eq.${encodeURIComponent(blogId)}`, {
          method: 'DELETE',
          auth: true,
        });
        if (editingBlogId && String(editingBlogId) === String(blogId)) {
          clearBlogEditMode(true);
        }
        await fetchBlogs();
        setStatus('Blog post deleted.', 'success');
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Delete failed.', 'error');
      }
      return;
    }

    const productId = target.getAttribute('data-delete-product');
    if (productId) {
      if (!window.confirm('Delete this product?')) return;
      try {
        await request(`/rest/v1/products?id=eq.${encodeURIComponent(productId)}`, {
          method: 'DELETE',
          auth: true,
        });
        if (editingProductId && String(editingProductId) === String(productId)) {
          clearProductEditMode(true);
        }
        await fetchProducts();
        setStatus('Product deleted.', 'success');
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Delete failed.', 'error');
      }
    }
  });

  document.addEventListener('DOMContentLoaded', async function () {
    if (!ensureConfigured()) {
      return;
    }

    if (accessToken) {
      try {
        enterDashboard();
        await refreshTables();
        setStatus('Session restored.', 'success');
      } catch (err) {
        localStorage.removeItem(tokenKey);
        accessToken = '';
        leaveDashboard();
        setStatus('Session expired. Please sign in again.', 'error');
      }
    }
  });
})();
