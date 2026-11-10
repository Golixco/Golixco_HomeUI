import { articles, articlePath, canonical, publicPaths } from '../src/blog/articles';
const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const sitemap = () =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicPaths.map((p) => `<url><loc>${canonical(p)}</loc><lastmod>2026-11-10</lastmod></url>`).join('')}</urlset>`;
export const rss = () =>
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>The Golixco Blog</title><link>https://golixco.com/blog</link><description>Company perspectives and product stories from Golixco.</description><language>en</language>${articles.map((a) => `<item><title>${xml(a.title)}</title><link>${canonical(articlePath(a))}</link><guid isPermaLink="true">${canonical(articlePath(a))}</guid><description>${xml(a.description)}</description></item>`).join('')}</channel></rss>`;
