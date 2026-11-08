import { createBlogHandler } from '../../scripts/lib/blog-edge.mjs';
import { cms, templates } from './lib/blog-data.mjs';

// No same-site fetch: templates are embedded at build time; article data stays live.
export default createBlogHandler({ cms, templates });
export const config = {
  path: ['/blog', '/blog/', '/blog.html', '/es/blog', '/es/blog/', '/es/blog.html'],
};
