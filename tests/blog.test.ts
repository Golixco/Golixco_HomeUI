import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { articles, articlePath, publicPaths, readingTime, canonical } from '../src/blog/articles';
import { summaryPrompt, summaryServices } from '../src/blog/SummaryWidget';
import { pageDocument } from '../scripts/page-document';
test('articles are substantial, distinct and maintain stable anchors', () => {
  for (const a of articles) {
    assert.ok(
      a.sections
        .map((s) => s.body)
        .join(' ')
        .split(/\s+/).length > 1000,
    );
    assert.ok(readingTime(a) >= 5);
    assert.equal(new Set(a.sections.map((s) => s.id)).size, a.sections.length);
    assert.ok(a.sections.some((s) => /interface/.test(s.id)));
    assert.equal(a.published, undefined);
  }
  assert.ok(articles[0].sections.some((s) => s.id === 'starting-point'));
  assert.ok(articles[1].sections.some((s) => s.id === 'edits'));
});
test('route documents have unique canonical, text-safe metadata and truthful JSON-LD', async () => {
  const template = await readFile('index.html', 'utf8');
  const titles = new Set();
  for (const path of publicPaths) {
    const html = pageDocument(template, path, '<main>Substantial content</main>');
    assert.ok(html.includes(`rel="canonical" href="${canonical(path)}"`));
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    const title = html.match(/<title>(.*?)<\/title>/)![1];
    titles.add(title);
    const graph = JSON.parse(
      html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1],
    )['@graph'];
    assert.ok(graph.some((x: { '@type': string }) => x['@type'] === 'Organization'));
    if (path.startsWith('/blog/')) {
      const post = graph.find((x: { '@type': string }) => x['@type'] === 'BlogPosting');
      assert.equal(post.datePublished, undefined);
      assert.equal(post.url, canonical(path));
    }
    assert.doesNotMatch(html, /localhost|127\.0\.0\.1/);
  }
  assert.equal(titles.size, 4);
});
test('AI summary prompt only contains the canonical public article; four safe external services', () => {
  for (const a of articles) {
    const prompt = summaryPrompt(canonical(articlePath(a)));
    const services = summaryServices(prompt);
    assert.equal(services.length, 4);
    const google = new URL(services[1].url);
    assert.equal(google.searchParams.get('q'), prompt);
    assert.equal(google.searchParams.get('udm'), '50');
    assert.doesNotMatch(prompt, /localhost|memory/i);
  }
  for (const bad of [
    'http://localhost:3000/blog/test',
    'https://golixco.com.evil.test/blog/test',
    'https://golixco.com/blog/test?secret=x',
  ])
    assert.throws(() => summaryPrompt(bad));
});
