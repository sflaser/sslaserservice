import { buildPageTitle, buildDescription, escapeHtml, formatDate, resolveOptimizedImageUrl, renderStructuredContent } from '../../assets/js/blog-rendering.mjs';

const ORIGIN = 'https://www.sslaserservice.com';
const replace = (html, pattern, value) => {
  if (!pattern.test(html)) throw new Error(`Missing blog template marker: ${pattern}`);
  return html.replace(pattern, () => value);
};
const articleUrl = (language, slug) => `${ORIGIN}${language === 'es' ? '/es' : ''}/blog.html?slug=${encodeURIComponent(slug)}`;
function publicImage(value) {
  if (!value) return '';
  try {
    const url = new URL(resolveOptimizedImageUrl(value), ORIGIN);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

export function renderBlog(template, post, language) {
  const canonical = articleUrl(language, post.slug);
  const title = escapeHtml(post.title);
  const description = buildDescription(post.excerpt || post.content);
  const image = publicImage(post.cover_image_url);
  let html = replace(template, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(buildPageTitle(post.title))}</title>`);
  html = replace(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}">`);
  html = replace(html, /<meta name="robots"[^>]*>/, '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">');
  html = replace(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${escapeHtml(canonical)}">`);
  html = html.replace(/(<link rel="alternate" hreflang="([^"]+)" href=")[^"]+("[^>]*>)/g,
    (_, before, lang, after) => before + escapeHtml(articleUrl(lang, post.slug)) + after);
  html = html.replace(/href="(\/es)?\/blog\.html"/g,
    (_, es) => `href="${escapeHtml(`${es || ''}/blog.html?slug=${encodeURIComponent(post.slug)}`)}"`);
  const structured = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: post.title, description, url: canonical, inLanguage: language === 'es' ? 'es' : 'en-US',
    image: image || undefined, datePublished: post.published_at || undefined,
    author: { '@id': `${ORIGIN}/#organization` }, publisher: { '@id': `${ORIGIN}/#organization` },
  };
  html = replace(html, /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script id="blog-post-structured-data" type="application/ld+json">${JSON.stringify(structured).replace(/</g, '\\u003c')}</script>`);
  html = html.replace('</head>', `<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
</head>`);
  html = replace(html, /<section id="blog-state"[^>]*>[\s\S]*?<\/section>/, '<section id="blog-state" class="blog-state" hidden></section>');
  html = replace(html, /<article id="blog-detail-card"[^>]*>/, '<article id="blog-detail-card" class="blog-card" data-server-rendered="true">');
  for (const [id, value, tag] of [
    ['blog-date', escapeHtml(formatDate(post.published_at)), 'div'],
    ['blog-title', title, 'h1'],
    ['blog-excerpt', escapeHtml(post.excerpt || ''), 'p'],
    ['blog-body', renderStructuredContent(post.content), 'div'],
  ]) {
    html = replace(html, new RegExp(`(<${tag} id="${id}"[^>]*>)[\\s\\S]*?<\\/${tag}>`),
      `<${tag} id="${id}" class="${id}">${value}</${tag}>`);
  }
  if (image) {
    html = replace(html, /<div id="blog-cover-frame"[^>]*>/, '<div id="blog-cover-frame" class="blog-cover-frame">');
    html = replace(html, /<img id="blog-cover"[^>]*>/, `<img id="blog-cover" class="blog-cover" src="${escapeHtml(image)}" alt="${title}">`);
  }
  return html;
}

function unavailable(template, status) {
  const message = status === 404 ? 'Blog post not found or not published.' : 'This article is temporarily unavailable. Please try again.';
  // An error response must not hydrate itself into an indexable article.
  return template.replace(/<script\b[^>]*src="\/assets\/js\/cms-blog-detail\.js[^>]*><\/script>/g, '')
    .replace(/(<section id="blog-state"[^>]*>)[\s\S]*?<\/section>/, `$1${message}</section>`);
}

export function createBlogHandler({ cms, templates, fetchImpl = fetch }) {
  return async function handler(request) {
    if (!['GET', 'HEAD'].includes(request.method)) return;
    const url = new URL(request.url);
    const language = url.pathname.startsWith('/es/') ? 'es' : 'en';
    const template = templates[language];
    let status = 404;
    let html;
    try {
      const slugs = url.searchParams.getAll('slug');
      const ids = url.searchParams.getAll('id');
      const value = (slugs[0] || ids[0] || '').trim();
      if (value && value.length <= 200 && (!ids.length || /^\d+$/.test(value)) && slugs.length <= 1 && ids.length <= 1 && !(slugs.length && ids.length)) {
        const query = new URL(`${cms.supabaseUrl.replace(/\/+$/, '')}/rest/v1/blog_posts`);
        query.searchParams.set('select', 'title,slug,excerpt,content,cover_image_url,published_at,status');
        query.searchParams.set('status', 'eq.published');
        query.searchParams.set('limit', '1');
        query.searchParams.set(slugs.length ? 'slug' : 'id', `eq.${value}`);
        const response = await fetchImpl(query, {
          headers: { apikey: cms.supabaseAnonKey, Accept: 'application/json' },
          signal: AbortSignal.timeout(8000), cache: 'no-store',
        });
        if (!response.ok) throw new Error('CMS unavailable');
        const rows = await response.json();
        if (!Array.isArray(rows)) throw new Error('Invalid CMS response');
        const post = rows[0] || null;
        if (post && post.status === 'published' && post.slug && String(post.title || '').trim() && String(post.content || '').trim()) {
          html = renderBlog(template, post, language);
          status = 200;
        }
      }
    } catch {
      status = 503;
    }
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      // Published/unpublished state is evaluated on every request, including CDN requests.
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
    if (status !== 200) headers['X-Robots-Tag'] = 'noindex, noarchive';
    if (status === 503) headers['Retry-After'] = '60';
    return new Response(request.method === 'HEAD' ? null : (html || unavailable(template, status)), { status, headers });
  };
}
