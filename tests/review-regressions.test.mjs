import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { renderTextInline, renderStructuredContent } from '../assets/js/blog-rendering.mjs';
import { createBlogHandler, renderBlog } from '../scripts/lib/blog-edge.mjs';

const root = new URL('../', import.meta.url);
const read = (name) => readFile(new URL(name, root), 'utf8');
const templates = { en: await read('blog.html'), es: await read('es/blog.html') };
const post = { title: 'Published example', slug: 'example_slug', content: '# Repair\n\n[Manual](https://example.test/laser_service_manual.pdf)', excerpt: 'Repair guide', status: 'published', published_at: '2026-11-08T08:00:00Z' };
const cms = { supabaseUrl: 'https://api.invalid', supabaseAnonKey: 'public-test-key' };

test('Markdown preserves URL underscores, code, escaped attributes and inline emphasis', () => {
  const result = renderTextInline('[**Manual**](https://example.test/laser_service_manual.pdf?q=a_b_c) and `*literal_code*`');
  assert.match(result, /href="https:\/\/example.test\/laser_service_manual.pdf\?q=a_b_c"/);
  assert.match(result, /<strong>Manual<\/strong>/);
  assert.match(result, /<code>\*literal_code\*<\/code>/);
  assert.equal(renderTextInline('<img onerror="run()">'), '&lt;img onerror=&quot;run()&quot;&gt;');
  assert(!renderTextInline('[x](javascript:alert(1))').includes('<a'));
  assert(!renderTextInline('[x](https://example.test/"onmouseover="x)').includes('href="https://example.test/"'));
  assert.match(renderStructuredContent('## Header\n\n- first\n- second\n\n> quote'), /<h2>Header<\/h2><ul><li>first/);
});

test('Markdown emphasis can wrap or span links/code without rewriting protected content', () => {
  const link = '<a href="https://example.test/laser_service_manual.pdf" target="_blank" rel="noopener">Download</a>';
  assert.equal(renderTextInline('**[Download](https://example.test/laser_service_manual.pdf)**'), `<strong>${link}</strong>`);
  assert.equal(renderTextInline('*[Download](https://example.test/laser_service_manual.pdf)*'), `<em>${link}</em>`);
  assert.equal(renderTextInline('**Before [Download](https://example.test/laser_service_manual.pdf) and `a_b_c` after**'),
    `<strong>Before ${link} and <code>a_b_c</code> after</strong>`);
  assert.equal(renderTextInline('__*Read [Download](https://example.test/laser_service_manual.pdf) and `**literal**`*__'),
    `<strong><em>Read ${link} and <code>**literal**</code></em></strong>`);
  assert.equal(renderTextInline('[**Use `a_b_c`**](https://example.test/a_b_c)'),
    '<a href="https://example.test/a_b_c" target="_blank" rel="noopener"><strong>Use <code>a_b_c</code></strong></a>');
  assert.equal(renderTextInline('literal \uE0000\uE001 **`safe`**'), 'literal \uE0000\uE001 <strong><code>safe</code></strong>');
});

test('Published article is fully rendered and safely escaped in the initial HTML', () => {
  for (const language of ['en', 'es']) {
    const html = renderBlog(templates[language], { ...post, title: '"</script><img src=x onerror=run()>', cover_image_url: 'javascript:run()' }, language);
    assert.match(html, /name="robots" content="index,follow/);
    assert.match(html, /data-server-rendered="true"/);
    assert.match(html, /<h1 id="blog-title" class="blog-title">&quot;&lt;\/script&gt;/);
    assert.match(html, /<a href="https:\/\/example.test\/laser_service_manual.pdf"/);
    assert(!html.includes('<img src=x'));
    assert(!html.includes('src="javascript:'));
    assert.match(html, /href="\/es\/blog.html\?slug=example_slug" class="lang-option/);
    assert.match(html, /href="\/blog.html\?slug=example_slug" class="lang-option/);
    assert(!html.includes('Loading blog post'));
  }
});

test('Edge handler checks fresh published data and emits no-cache HTML for all supported route shapes', async () => {
  let calls = 0;
  const handler = createBlogHandler({ cms, templates, fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url.origin, 'https://api.invalid');
    assert.equal(url.searchParams.get('status'), 'eq.published');
    assert.equal(options.headers.apikey, 'public-test-key');
    assert.equal(options.cache, 'no-store');
    assert(options.signal instanceof AbortSignal);
    return Response.json([post]);
  } });
  for (const path of ['/blog', '/blog/', '/blog.html', '/es/blog', '/es/blog/', '/es/blog.html']) {
    const response = await handler(new Request('https://www.sslaserservice.com' + path + '?slug=example_slug'));
    assert.equal(response.status, 200);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.match(await response.text(), /<h1 id="blog-title" class="blog-title">Published example<\/h1>/);
  }
  assert.equal(calls, 6);
  const head = await handler(new Request('https://www.sslaserservice.com/blog?slug=example_slug', { method: 'HEAD' }));
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

test('Empty, duplicate and ambiguous identifiers never fetch or become indexable', async () => {
  const handler = createBlogHandler({ cms, templates, fetchImpl: () => { throw new Error('unexpected fetch'); } });
  for (const query of ['', '?slug=', '?slug=a&slug=b', '?slug=a&id=1', '?id=invalid']) {
    const response = await handler(new Request('https://site.test/blog' + query));
    assert.equal(response.status, 404);
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
    const html = await response.text();
    assert.match(html, /name="robots" content="noindex/);
    assert(!html.includes('src="/assets/js/cms-blog-detail.js'));
  }
});

test('Missing, draft, empty and subsequently unpublished posts remain noindex / 404', async () => {
  for (const rows of [[], [{ ...post, status: 'draft' }], [{ ...post, content: '' }]]) {
    const handler = createBlogHandler({ cms, templates, fetchImpl: async () => Response.json(rows) });
    const response = await handler(new Request('https://site.test/blog?slug=example_slug'));
    assert.equal(response.status, 404);
    assert.match(await response.text(), /name="robots" content="noindex/);
  }
  let published = true;
  const handler = createBlogHandler({ cms, templates, fetchImpl: async () => Response.json(published ? [post] : []) });
  assert.equal((await handler(new Request('https://site.test/blog?slug=example_slug'))).status, 200);
  published = false;
  assert.equal((await handler(new Request('https://site.test/blog?slug=example_slug'))).status, 404);
});

test('CMS outage / invalid response fails closed with retryable 503 and noindex', async () => {
  for (const fetchImpl of [async () => new Response('', { status: 500 }), async () => { throw new Error('timeout'); }, async () => new Response('not json'), async () => Response.json({ unexpected: true })]) {
    const handler = createBlogHandler({ cms, templates, fetchImpl });
    const response = await handler(new Request('https://site.test/es/blog?slug=a'));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('retry-after'), '60');
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
    assert.match(await response.text(), /name="robots" content="noindex/);
  }
});

function element() {
  const e = { value: '', files: [], textContent: '', innerHTML: '', hidden: false, attrs: {}, handlers: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {} }, scrollIntoView() {},
    setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; },
    addEventListener(k, f) { this.handlers[k] = f; }, querySelector() { return element(); },
    reset() { for (const c of Object.values(this.elements)) c.value = ''; } };
  e.elements = new Proxy({}, { get(t, k) { return t[k] || (t[k] = element()); } }); return e;
}
async function adminHarness(allowed = true) {
  const els = {}, calls = [], stored = {};
  const get = id => els[id] || (els[id] = element());
  const marker = '<img src=x onerror="window.injected=true">';
  const rows = { blogs: [{ id: '1" onclick="x', title: marker, status: marker }], products: [{ id: '2" onclick="x', name: marker, status: marker, currency: marker }] };
  const context = {
    window: { CMS_CONFIG: cms }, document: { getElementById: get, addEventListener() {} },
    localStorage: { getItem(k) { return stored[k] || ''; }, setItem(k,v) { stored[k]=v; }, removeItem(k) { delete stored[k]; } },
    URL, HTMLElement: class {}, File: class {}, FormData: class {
      constructor(form) { this.form=form; }
      get(k) { if (k === 'image_url') return get('product-image-url').value; if (k === 'brochure_url') return get('product-brochure-url').value; return this.form.elements[k].value; }
    }, fetch: async (url, options) => {
      calls.push({url, ...options});
      let data = url.includes('blog_posts') ? rows.blogs : rows.products;
      if (url.includes('is_cms_admin')) data = allowed;
      if (url.includes('/auth/v1/token')) data = { access_token: 'fake-test-token' };
      return { ok: true, headers: { get() { return 'application/json'; } }, json: async () => data };
    }, Map, console,
  };
  const code = (await read('assets/js/cms-admin.js')).replace(/\}\)\(\);\s*$/, 'globalThis.audit={fetchBlogs,fetchProducts,setProductEditMode,requireAdmin};\n})();');
  vm.createContext(context); vm.runInContext(code, context);
  return { context, get, calls, marker, stored };
}

test('CMS tables encode stored HTML and attribute characters in all row fields', async () => {
  const { context, get, marker } = await adminHarness();
  await context.audit.fetchBlogs(); await context.audit.fetchProducts();
  for (const id of ['blogs-table-body', 'products-table-body']) {
    const html = get(id).innerHTML;
    assert(!html.includes(marker)); assert(!html.includes('<img'));
    assert(!html.includes('" onclick="x'));
    assert.match(html, /&lt;img/);
  }
});

test('Editing existing product assets supports unchanged, replaced and cleared URLs', async () => {
  const { context, get, calls } = await adminHarness();
  for (const value of ['https://assets.test/old.jpg', 'https://assets.test/new.jpg', '/images/products/new.jpg', '']) {
    context.audit.setProductEditMode({ id: 2, name: 'Example', image_url: 'https://assets.test/old.jpg', brochure_url: 'https://assets.test/old.pdf' });
    get('product-image-url').value=value; get('product-brochure-url').value=value.replace('.jpg','.pdf');
    await get('product-form').handlers.submit({ preventDefault() {} });
    const payload = JSON.parse(calls.filter(c => c.method === 'PATCH').at(-1).body);
    assert.equal(payload.image_url, value || null); assert.equal(payload.brochure_url, value.replace('.jpg','.pdf') || null);
  }
});

test('Non-admin login discards the token; admitted admin stores it only after RPC', async () => {
  for (const allowed of [false, true]) {
    const { get, stored, calls } = await adminHarness(allowed);
    await get('login-form').handlers.submit({preventDefault() {}});
    assert.equal(Boolean(stored.cms_admin_access_token), allowed);
    assert(calls.some(c => c.url.endsWith('/rest/v1/rpc/is_cms_admin')));
    if (!allowed) {
      assert.match(get('admin-status').textContent, /not authorized/);
      assert(!calls.some(c => c.url.includes('blog_posts')));
    }
  }
});
