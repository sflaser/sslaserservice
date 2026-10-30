import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const ORIGIN = 'https://www.sslaserservice.com';
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
const jsonScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
const replaceOnce = (source, pattern, value) => {
  if (!pattern.test(source)) throw new Error(`Product template marker missing: ${pattern}`);
  return source.replace(pattern, () => value);
};
const shortDescription = (value) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length <= 160 ? text : `${text.slice(0, 157).replace(/\s+\S*$/, '').replace(/[,:;\s]+$/, '')}…`;
};
const pageTitle = (name) => {
  const suffix = ' | skyfirelaser';
  const text = name.replace(/\s+/g, ' ').trim();
  const available = 65 - suffix.length;
  return `${text.length > available ? text.slice(0, available).replace(/\s+\S*$/, '').trim() : text}${suffix}`;
};
function publicUrl(value) {
  if (!value) return '';
  const url = new URL(value, ORIGIN);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Unsafe product resource URL');
  return value;
}
function imageUrl(value) {
  const overrides = {
    '/images/products/passive-components/pump-signal-combiner.png': '/images/products/passive-components/pump-signal-combiner-skyfire-retouched.png',
    '/images/products/passive-components/pm-pump-signal-combiner.png': '/images/products/passive-components/pm-pump-signal-combiner-skyfire-retouched.png',
    '/images/products/passive-components/20w-inline-isolator.png': '/images/products/passive-components/20w-inline-isolator-skyfire-retouched.png',
    '/images/products/passive-components/1w-inline-isolator.png': '/images/products/passive-components/1w-inline-isolator-skyfire-retouched.png',
  };
  return publicUrl(overrides[value] || value);
}
function quoteHref(name, canonical, email) {
  const subject = encodeURIComponent(`Quote request: ${name}`);
  const body = encodeURIComponent([
    'Hello skyfirelaser team,', '',
    `I would like to request pricing and availability for ${name}.`,
    `Product page: ${canonical}`, '',
    'Please send pricing, lead time, and any configuration details needed for quotation.', '',
    'Quantity:', 'Application:', 'Company:', '', 'Thank you.',
  ].join('\n'));
  return `mailto:${email}?subject=${subject}&body=${body}`;
}
function renderList(items) {
  const values = Array.isArray(items) ? items.filter(Boolean) : [];
  return values.length ? values.map((x) => `<li>${escapeHtml(x)}</li>`).join('') : '<li>Send the product name and application context for technical review.</li>';
}
function renderTable(table) {
  const columns = Array.isArray(table.columns) ? table.columns : [];
  const rows = Array.isArray(table.rows) ? table.rows : [];
  return `<article class="spec-block"><h3>${escapeHtml(table.title || 'Specifications')}</h3><div class="spec-table-wrap"><table class="spec-table"><thead><tr>${columns.map((c) => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((_, i) => `<td>${escapeHtml(row[i] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></article>`;
}
export function renderProduct(template, product, detail, email) {
  const name = product.name;
  const slug = product.slug;
  const canonical = `${ORIGIN}/components/product.html?slug=${encodeURIComponent(slug)}`;
  const overview = detail.overview || product.description || product.short_description || '';
  const description = shortDescription(product.short_description || overview);
  const category = detail.category || 'Component details';
  const image = imageUrl(product.image_url);
  const brochure = publicUrl(product.brochure_url);
  let html = template;
  const putText = (tag, id, text) => { html = replaceOnce(html, new RegExp(`<${tag} id="${id}"[^>]*>[\\s\\S]*?</${tag}>`), `<${tag} id="${id}">${escapeHtml(text)}</${tag}>`); };
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(pageTitle(name))}</title>`);
  html = replaceOnce(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}">`);
  html = replaceOnce(html, /<meta name="robots"[^>]*>/, '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">');
  html = replaceOnce(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}">`);
  html = replaceOnce(html, /<body>/, `<body data-prerendered-product="${slug}">`);
  html = replaceOnce(html, /<p id="product-detail-state"[^>]*>[\s\S]*?<\/p>/, '<p id="product-detail-state" class="detail-state" hidden></p>');
  html = replaceOnce(html, /<span id="product-category"[^>]*>[\s\S]*?<\/span>/, `<span id="product-category" class="eyebrow">${escapeHtml(category)}</span>`);
  putText('h1', 'product-title', name);
  putText('p', 'product-summary', overview);
  const actions = `<a class="btn btn-primary" href="${escapeHtml(quoteHref(name, canonical, email))}">Ask for Quote</a>${brochure ? `<a class="btn btn-outline" href="${escapeHtml(brochure)}" target="_blank" rel="noopener">Download Brochure</a>` : ''}<a class="btn btn-outline" href="/components/#product-catalog">Back to Components</a>`;
  html = replaceOnce(html, /<div id="product-actions"[^>]*>[\s\S]*?<\/div>/, `<div id="product-actions" class="product-detail-actions">${actions}</div>`);
  html = replaceOnce(html, /<aside id="product-image-wrap"[^>]*>[\s\S]*?<\/aside>/, `<aside id="product-image-wrap" class="panel product-detail-visual"${image ? '' : ' hidden'}><img id="product-image" src="${escapeHtml(image)}" alt="${escapeHtml(name)}"></aside>`);
  for (const [id, items] of [['product-features', detail.features], ['product-applications', detail.applications]]) {
    html = replaceOnce(html, new RegExp(`<ul id="${id}"[^>]*>[\\s\\S]*?</ul>`), `<ul id="${id}">${renderList(items)}</ul>`);
  }
  const tables = Array.isArray(detail.tables) ? detail.tables : [];
  html = replaceOnce(html, /<div id="product-specs"[^>]*>[\s\S]*?<\/div>/, `<div id="product-specs">${tables.length ? tables.map(renderTable).join('') : '<p class="detail-muted">Send the product name and application context for a configuration review.</p>'}</div>`);
  html = replaceOnce(html, /<p id="product-source-note"[^>]*>[\s\S]*?<\/p>/, '<p id="product-source-note" class="source-note">Specifications are organized from the product documentation and should be confirmed during quotation.</p>');
  const graph = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${canonical}#webpage`, name, description, url: canonical, isPartOf: { '@id': `${ORIGIN}/#website` }, primaryImageOfPage: image ? new URL(image, ORIGIN).href : undefined },
    { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Components', item: `${ORIGIN}/components/` },
      { '@type': 'ListItem', position: 3, name, item: canonical },
    ] },
  ] };
  const metas = [['og:title', `${name} | skyfirelaser`], ['og:description', description], ['og:type', 'product'], ['og:url', canonical]];
  if (image) metas.push(['og:image', new URL(image, ORIGIN).href], ['og:image:alt', name]);
  const metadata = metas.map(([property, value]) => `<meta property="${property}" content="${escapeHtml(value)}">`).join('\n');
  html = html.replace('</head>', `${metadata}\n<script id="product-structured-data" type="application/ld+json">${jsonScript(graph)}</script>\n</head>`);
  return html;
}
export function buildEdgeSource(slugs) {
  return `// Generated from the same published products as the static HTML.\nconst slugs = new Set(${JSON.stringify(slugs)});\nexport default function handler(request) {\n  const url = new URL(request.url);\n  const values = url.searchParams.getAll('slug');\n  if (!['GET', 'HEAD'].includes(request.method) || values.length !== 1 || !slugs.has(values[0])) return;\n  url.pathname = '/components/prerendered/' + values[0] + '.html';\n  return url;\n}\nexport const config = { path: '/components/product.html', onError: 'bypass' };\n`;
}
export async function build(root, options = {}) {
  const read = (path) => readFile(join(root, path), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(await read('assets/js/cms-config.js'), sandbox, { timeout: 1000 });
  vm.runInContext(await read('assets/js/component-product-details.js'), sandbox, { timeout: 1000 });
  const cfg = sandbox.window.CMS_CONFIG;
  const detailData = sandbox.window.COMPONENT_PRODUCT_DETAILS;
  const sitemap = await read('sitemap.xml');
  const slugs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1].replace(/&amp;/g, '&'))).filter((u) => u.origin === ORIGIN && u.pathname === '/components/product.html').map((u) => u.searchParams.get('slug'));
  if (!slugs.length || slugs.some((s) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) || new Set(slugs).size !== slugs.length) throw new Error('Invalid or duplicate component slugs in sitemap');
  if (!cfg?.supabaseUrl || !cfg?.supabaseAnonKey) throw new Error('Published product API is not configured');
  const api = new URL('/rest/v1/products', cfg.supabaseUrl);
  api.searchParams.set('select', 'name,slug,short_description,description,image_url,brochure_url,status');
  api.searchParams.set('status', 'eq.published');
  api.searchParams.set('slug', `in.(${slugs.join(',')})`);
  api.searchParams.set('limit', String(slugs.length));
  let products;
  try {
    const response = await (options.fetch || fetch)(api, { headers: { apikey: cfg.supabaseAnonKey, Authorization: `Bearer ${cfg.supabaseAnonKey}`, Accept: 'application/json' }, signal: AbortSignal.timeout(options.timeoutMs || 20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    products = await response.json();
  } catch (error) {
    throw new Error(`Cannot prerender component products: published product API failed (${error.message}). Deployment stopped; no fallback snapshot is published.`);
  }
  if (!Array.isArray(products)) throw new Error('Published product API returned invalid data');
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  if (bySlug.size !== products.length) throw new Error('Published product API returned duplicate slugs');
  const template = await read('components/product.html');
  // Validate all outputs before replacing any generated file.
  const pages = slugs.map((slug) => {
    const product = bySlug.get(slug);
    if (!product?.name || product.status !== 'published' || !detailData[slug]) throw new Error(`Cannot prerender ${slug}: published product or existing specification data missing`);
    return [slug, renderProduct(template, product, detailData[slug], cfg.inquiryEmail || 'sales3@sflaser.net')];
  });
  const output = join(root, 'components/prerendered');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await Promise.all(pages.map(([slug, html]) => writeFile(join(output, `${slug}.html`), html)));
  await mkdir(join(root, 'netlify/edge-functions'), { recursive: true });
  await writeFile(join(root, 'netlify/edge-functions/component-product.js'), buildEdgeSource(slugs));
  console.log(`Prerendered ${pages.length} existing component products; preserved query URLs.`);
  return { slugs, pages };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  build(resolve(process.argv[2] || '.')).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
