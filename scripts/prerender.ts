import { build } from 'esbuild';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { articles, articlePath, canonical, publicPaths } from '../src/blog/articles';
import { rss, sitemap } from './feeds';
import { pageDocument } from './page-document';
await mkdir('.prerender', { recursive: true });
try {
  await build({
    entryPoints: ['src/entry-server.tsx'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outfile: '.prerender/render.mjs',
  });
  const bundlePath = '../.prerender/render.mjs';
  const { render } = await import(bundlePath);
  const template = await readFile('dist/index.html', 'utf8');
  for (const path of publicPaths) {
    const dir = path === '/' ? 'dist' : `dist${path}`;
    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}/index.html`, pageDocument(template, path, render(path)));
  }
  await writeFile('dist/sitemap.xml', sitemap());
  await writeFile('dist/rss.xml', rss());
  console.log(
    `Prerendered ${publicPaths.length} routes, sitemap and RSS with recorded publication dates.`,
  );
} finally {
  await rm('.prerender', { recursive: true, force: true });
}
