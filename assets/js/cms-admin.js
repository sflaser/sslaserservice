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

  const tokenKey = 'cms_admin_access_token';
  let accessToken = localStorage.getItem(tokenKey) || '';

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
      '/rest/v1/blog_posts?select=id,title,status,published_at,created_at&order=created_at.desc',
      { auth: true }
    );

    blogsTableBody.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>${row.id}</td>
            <td>${row.title}</td>
            <td><span class="badge ${row.status}">${row.status}</span></td>
            <td>${row.published_at ? new Date(row.published_at).toLocaleString() : '-'}</td>
            <td><button class="btn btn-danger" data-delete-blog="${row.id}">Delete</button></td>
          </tr>
        `
      )
      .join('');
  }

  async function fetchProducts() {
    const rows = await request(
      '/rest/v1/products?select=id,name,status,price_cents,currency,created_at&order=created_at.desc',
      { auth: true }
    );

    productsTableBody.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>${row.id}</td>
            <td>${row.name}</td>
            <td>${(Number(row.price_cents || 0) / 100).toFixed(2)} ${(row.currency || 'USD').toUpperCase()}</td>
            <td><span class="badge ${row.status}">${row.status}</span></td>
            <td><button class="btn btn-danger" data-delete-product="${row.id}">Delete</button></td>
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

      let coverImageUrl = '';
      const imageFile = formData.get('cover_image');
      if (imageFile instanceof File && imageFile.size > 0) {
        setStatus('Uploading blog cover image...');
        coverImageUrl = await uploadImage(imageFile, 'blog');
      }

      await request('/rest/v1/blog_posts', {
        method: 'POST',
        auth: true,
        body: {
          title,
          slug,
          excerpt,
          content,
          cover_image_url: coverImageUrl || null,
          status,
          published_at: status === 'published' ? new Date().toISOString() : null,
        },
      });

      blogForm.reset();
      await fetchBlogs();
      setStatus('Blog post saved.', 'success');
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

      let imageUrl = '';
      const imageFile = formData.get('image');
      if (imageFile instanceof File && imageFile.size > 0) {
        setStatus('Uploading product image...');
        imageUrl = await uploadImage(imageFile, 'products');
      }

      await request('/rest/v1/products', {
        method: 'POST',
        auth: true,
        body: {
          name,
          slug,
          short_description: shortDescription,
          description,
          price_cents: Math.round(price * 100),
          currency,
          purchase_url: purchaseUrl,
          image_url: imageUrl || null,
          status,
          published_at: status === 'published' ? new Date().toISOString() : null,
        },
      });

      productForm.reset();
      await fetchProducts();
      setStatus('Product saved.', 'success');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to save product.', 'error');
    }
  });

  document.addEventListener('click', async function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const blogId = target.getAttribute('data-delete-blog');
    if (blogId) {
      if (!window.confirm('Delete this blog post?')) return;
      try {
        await request(`/rest/v1/blog_posts?id=eq.${encodeURIComponent(blogId)}`, {
          method: 'DELETE',
          auth: true,
        });
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
