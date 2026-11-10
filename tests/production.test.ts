import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { redactAnalytics } from '../src/analytics';
import {
  articles,
  articlePath,
  publicPaths,
  canonical,
} from '../src/blog/articles';
import { summaryPrompt, summaryServices } from '../src/blog/SummaryWidget';
import { pageDocument } from '../scripts/page-document';

test('analytics strips sensitive query/hash values and rejects events and unknown routes', () => {
  for (const path of publicPaths) {
    const event = redactAnalytics({
      type: 'pageview',
      url: canonical(path) + '?message=private#secret',
    });
    assert.equal(event?.url, canonical(path));
  }
  assert.equal(
    redactAnalytics({
      type: 'pageview',
      url: 'https://golixco.com/api/chat?key=private',
    }),
    null,
  );
  assert.equal(redactAnalytics({ type: 'pageview', url: 'invalid' }), null);
  assert.equal(redactAnalytics({ type: 'event', url: canonical('/') }), null);
});
test('new shared OG asset has truthful dimensions; articles keep unique previews', async () => {
  const png = await readFile('public/og-image.png');
  assert.equal(png.readUInt32BE(16), 1672);
  assert.equal(png.readUInt32BE(20), 941);
  const template = await readFile('index.html', 'utf8');
  for (const path of publicPaths) {
    const html = pageDocument(template, path, '<main>content</main>');
    const image = path.startsWith('/blog/')
      ? `${canonical(path)}-social.png`
      : canonical('/og-image.png');
    assert.ok(html.includes(`property="og:image" content="${image}"`));
    assert.ok(html.includes(`name="twitter:image" content="${image}"`));
    assert.doesNotMatch(html, /golixco-wordmark.png/);
  }
});
test('summary links encode each canonical article safely and keep unverified services on fallback', () => {
  for (const article of articles) {
    const prompt = summaryPrompt(canonical(articlePath(article)));
    assert.match(prompt, /important details.*factual claims from opinions/);
    const services = summaryServices(prompt);
    for (const service of services)
      assert.equal(new URL(service.url).protocol, 'https:');
    assert.equal(new URL(services[2].url).searchParams.get('q'), prompt);
    assert.equal(new URL(services[1].url).searchParams.get('q'), prompt);
    assert.equal(services[0].url, 'https://chatgpt.com/');
    assert.equal(services[3].url, 'https://claude.ai/new');
  }
});
