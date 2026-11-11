import assert from 'node:assert/strict';

const origin = 'https://golixco.com';
const response = await fetch(`${origin}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: origin },
  body: JSON.stringify({ message: 'hi', history: [] }),
  signal: AbortSignal.timeout(25_000),
});

assert.equal(response.status, 200, 'Production chat HTTP status');
assert.match(response.headers.get('content-type') ?? '', /^text\/event-stream\b/);

const events = (await response.text())
  .split(/\r?\n\r?\n/)
  .flatMap((frame) => {
    const data = frame.split(/\r?\n/).filter((line) => line.startsWith('data:'));
    return data.length ? [JSON.parse(data.map((line) => line.slice(5)).join('\n'))] : [];
  });

assert.equal(events[0]?.source, 'knowledge', 'Greeting uses curated knowledge');
assert.ok(events.some((event) => event.type === 'delta' && event.text?.trim()), 'Greeting has text');
assert.ok(events.every((event) => event.type !== 'error'), 'Greeting stream has no errors');
assert.equal(events.at(-1)?.type, 'done', 'Greeting stream completes');

console.log('Production chat returned HTTP 200 and a complete greeting stream.');
