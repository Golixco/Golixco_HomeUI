import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGemini } from '../server/gemini';
import { createFailover } from '../server/providers';
const collect = async (s: AsyncIterable<string>) => {
  let t = '';
  for await (const p of s) t += p;
  return t;
};
const event = (o: unknown) => `data: ${JSON.stringify(o)}\r\n\r\n`;
const signal = () => new AbortController().signal;
const text = (s: string, finishReason?: string) => ({
  candidates: [{ content: { parts: [{ text: s }] }, finishReason }],
});
test('Gemini REST stream handles split UTF-8/CRLF, skips thought parts and preserves request bounds', async () => {
  let body: any;
  const source =
    event({
      candidates: [
        {
          content: {
            parts: [
              { text: 'private reasoning', thought: true },
              { text: 'こんにちは ' },
            ],
          },
        },
      ],
    }) + event(text('Lolixco', 'STOP'));
  const bytes = new TextEncoder().encode(source);
  const provider = createGemini(async (url, init) => {
    assert.match(
      String(url),
      /^https:\/\/generativelanguage.googleapis.com\/v1beta\/models\/[^/]+:streamGenerateContent\?alt=sse$/,
    );
    body = JSON.parse(String(init?.body));
    return new Response(
      new ReadableStream({
        start(c) {
          for (const byte of bytes) c.enqueue(new Uint8Array([byte]));
          c.close();
        },
      }),
    );
  });
  assert.equal(
    await collect(provider('Compare Lolixco', [], signal())),
    'こんにちは Lolixco',
  );
  assert.equal(body.generationConfig.maxOutputTokens, 2048);
  assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, 'MINIMAL');
  assert.match(body.systemInstruction.parts[0].text, /identities|leadership/);
});
for (const quota of [429, 'RESOURCE_EXHAUSTED'])
  test(`structured SSE quota ${quota} reaches fallback once`, async () => {
    let attempts = 0,
      fallbacks = 0;
    const primary = createGemini(
      async () =>
        new Response(
          event({
            error:
              typeof quota === 'number'
                ? { code: quota, message: 'PRIVATE' }
                : { status: quota, message: 'PRIVATE' },
          }),
        ),
    );
    const provider = createFailover(
      primary,
      async function* () {
        fallbacks++;
        yield 'Fallback';
      },
      () => {
        attempts++;
      },
    );
    assert.equal(
      await collect(provider('Compare Lolixco', [], signal())),
      'Fallback',
    );
    assert.equal(fallbacks, 1);
    assert.equal(attempts, 2);
  });
test('non-quota SSE errors and incomplete/partial responses never switch providers', async () => {
  for (const data of [
    event({ error: { code: 403, message: 'PRIVATE' } }),
    event(text('partial', 'MAX_TOKENS')),
    event(text('partial')),
  ]) {
    let fallback = false;
    const p = createFailover(
      createGemini(async () => new Response(data)),
      async function* () {
        fallback = true;
        yield 'bad';
      },
      () => {},
    );
    await assert.rejects(
      () => collect(p('Compare Lolixco', [], signal())),
      (e) => {
        assert.doesNotMatch(String(e), /PRIVATE/);
        return true;
      },
    );
    assert.equal(fallback, false);
  }
});
test('quota after text never mixes a fallback into the existing answer', async () => {
  let fallback = false;
  const p = createFailover(
    createGemini(
      async () =>
        new Response(event(text('partial')) + event({ error: { code: 429 } })),
    ),
    async function* () {
      fallback = true;
      yield 'bad';
    },
    () => {},
  );
  await assert.rejects(() => collect(p('Compare Lolixco', [], signal())));
  assert.equal(fallback, false);
});
test('HTTP errors remain structured and credentials never enter URLs or response errors', async () => {
  const p = createGemini(async (url) => {
    assert.doesNotMatch(String(url), /key=/);
    return new Response('SECRET PROVIDER BODY', { status: 429 });
  });
  await assert.rejects(
    () => collect(p('Compare Lolixco', [], signal())),
    (e) => {
      assert.equal((e as { status: number }).status, 429);
      assert.doesNotMatch(String(e), /SECRET/);
      return true;
    },
  );
});
