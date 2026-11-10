import { articles, articlePath, canonical, publicPaths } from '../src/blog/articles';
import { socials } from '../shared/official';
const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function pageDocument(template: string, path: string, html: string) {
  const article = articles.find((a) => articlePath(a) === path);
  const exists = publicPaths.includes(path);
  const title = article
    ? `${article.title} — Golixco | Blog`
    : path === '/blog'
      ? 'Golixco | Blog'
      : exists
        ? 'Golixco | AI Company'
        : 'Page not found | Golixco';
  const description =
    article?.description ??
    (path === '/blog'
      ? 'Company perspectives and product stories from Golixco. Explore the thinking behind Golixco and the live Lolixco public beta.'
      : 'Golixco builds useful software and products with artificial intelligence, creativity and experimentation. Explore Lolixco, our live public-beta product.');
  const image = canonical(
    article ? `/blog/${article.slug}-social.png` : '/brand/golixco-wordmark.png',
  );
  const org = {
    '@type': 'Organization',
    '@id': 'https://golixco.com/#organization',
    name: 'Golixco',
    url: 'https://golixco.com/',
    logo: 'https://golixco.com/brand/golixco-icon.png',
    sameAs: socials.map((s) => s.url),
  };
  const graph: Record<string, unknown>[] = [
    org,
    {
      '@type': 'WebSite',
      '@id': 'https://golixco.com/#website',
      url: 'https://golixco.com/',
      name: 'Golixco',
      publisher: { '@id': org['@id'] },
    },
  ];
  if (path.startsWith('/blog')) {
    graph.push({
      '@type': 'Blog',
      name: 'Golixco | Blog',
      url: canonical('/blog'),
      publisher: { '@id': org['@id'] },
    });
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { name: 'Golixco', item: canonical('/') },
        { name: 'Blog', item: canonical('/blog') },
        ...(article ? [{ name: article.title, item: canonical(path) }] : []),
      ].map((item, i) => ({ '@type': 'ListItem', position: i + 1, ...item })),
    });
  }
  if (article)
    graph.push({
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.description,
      url: canonical(path),
      mainEntityOfPage: canonical(path),
      image: [image],
      author: { '@id': org['@id'] },
      publisher: { '@id': org['@id'] },
      dateModified: article.modified,
      ...(article.published ? { datePublished: article.published } : {}),
      inLanguage: 'en',
    });
  const head = `<title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="${exists ? 'index,follow' : 'noindex,nofollow'}">${exists ? `<link rel="canonical" href="${canonical(path)}">` : ''}
 <meta property="og:site_name" content="Golixco"><meta property="og:type" content="${article ? 'article' : 'website'}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical(path)}"><meta property="og:image" content="${image}"><meta property="og:image:width" content="${article ? 1200 : 1672}"><meta property="og:image:height" content="${article ? 630 : 941}"><meta property="og:image:alt" content="${escape(article?.coverAlt ?? 'Official Golixco emblem and wordmark')}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${image}"><link rel="alternate" type="application/rss+xml" title="Golixco | Blog" href="/rss.xml">${exists ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>` : ''}`;
  return template
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(
      /<meta\s+(?:name="(?:description|robots|twitter:[^"]+)"|property="(?:og|twitter):[^"]+")[^>]*>/g,
      '',
    )
    .replace(/<link rel="canonical"[^>]*>/g, '')
    .replace('<!--page-head-->', head)
    .replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${html}</div>`);
}
