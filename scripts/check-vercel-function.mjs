// Run after `vercel build --target=preview`. Test Vercel's real emitted JS, without tsx/esbuild.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const folder = resolve('.vercel/output/functions/api/chat.func');
for (const entry of await readdir(folder, { recursive: true })) {
  if (!entry.endsWith('.js') || entry.includes('node_modules/')) continue;
  const code = await readFile(resolve(folder, entry), 'utf8');
  assert.doesNotMatch(
    code,
    /(?:from\s*|import\s*\()['"][.][^'"]*\.ts['"]/,
    entry,
  );
}
const { default: handler } = await import(
  pathToFileURL(resolve(folder, 'api/chat.js')).href
);
const server = createServer(handler).listen(0, '127.0.0.1');
await once(server, 'listening');
const original = process.cwd();
try {
  process.chdir('/tmp');
  for (const [message, expected] of [
    ['hi', /Hi! Ask me about Golixco/],
    ['the ai used on lolixco?', /local media-signal analysis.*Gemini/],
    ['What is Golixco?', /builds software/],
  ]) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: [] }),
    });
    assert.equal(response.status, 200, message);
    assert.match(response.headers.get('content-type'), /text\/event-stream/);
    const body = await response.text();
    assert.match(body, /"source":"knowledge"/);
    assert.match(body, expected);
    assert.match(body, /"type":"done"/);
    assert.doesNotMatch(body, /"type":"error"/);
  }
  console.log(
    'Actual Vercel JavaScript artifact imports and serves curated SSE outside the source-tree cwd.',
  );
} finally {
  process.chdir(original);
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
