import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFailover, createBackboard } from '../server/providers';
const signal = () => new AbortController().signal;
const collect = async (stream: AsyncIterable<string>) => {
  let out = '';
  for await (const x of stream) out += x;
  return out;
};
for (const status of [429, 'RESOURCE_EXHAUSTED'])
  test(`Gemini quota ${status} falls back once and cooldown restores primary`, async () => {
    let calls = 0,
      fallbacks = 0,
      attempts = 0,
      now = 0;
    const provider = createFailover(
      async function* () {
        calls++;
        if (calls === 1) throw { status };
        yield 'Gemini';
      },
      async function* () {
        fallbacks++;
        yield 'Back';
        yield 'board';
      },
      () => {
        attempts++;
      },
      () => now,
    );
    assert.equal(await collect(provider('detail', [], signal())), 'Backboard');
    assert.equal(calls, 1);
    assert.equal(fallbacks, 1);
    assert.equal(attempts, 2);
    assert.equal(await collect(provider('detail', [], signal())), 'Backboard');
    assert.equal(calls, 1);
    now = 60_001;
    assert.equal(await collect(provider('detail', [], signal())), 'Gemini');
    assert.equal(calls, 2);
  });
test('Gemini 503 switches once without triggering quota cooldown', async () => {
  let primaryCalls = 0;
  let attempts = 0;
  const provider = createFailover(
    async function* () {
      if (++primaryCalls === 1) throw { status: 503 };
      yield 'Gemini';
    },
    async function* () { yield 'Backboard'; },
    () => { attempts++; },
    () => 0,
  );
  assert.equal(await collect(provider('detail', [], signal())), 'Backboard');
  assert.equal(await collect(provider('detail', [], signal())), 'Gemini');
  assert.equal(attempts, 3);
});
test('successful Gemini never touches fallback', async () => {
  let called = false;
  const p = createFailover(
    async function* () {
      yield 'Gemini';
    },
    async function* () {
      called = true;
      yield 'Backboard';
    },
    () => {},
  );
  assert.equal(await collect(p('x', [], signal())), 'Gemini');
  assert.equal(called, false);
});
for (const status of [401, 403, 500, 504])
  test(`ordinary ${status} never triggers fallback`, async () => {
    let calls = 0;
    const p = createFailover(
      async function* () {
        throw { status };
      },
      async function* () {
        calls++;
        yield 'bad';
      },
      () => {},
    );
    await assert.rejects(() => collect(p('x', [], signal())));
    assert.equal(calls, 0);
  });
test('partial Gemini quota never mixes provider text', async () => {
  let called = false;
  let text = '';
  const p = createFailover(
    async function* () {
      yield 'Partial';
      throw { status: 429 };
    },
    async function* () {
      called = true;
      yield 'other';
    },
    () => {},
  );
  await assert.rejects(async () => {
    for await (const chunk of p('x', [], signal())) text += chunk;
  });
  assert.equal(text, 'Partial');
  assert.equal(called, false);
});
test('fallback shares application attempt budget', async () => {
  let attempts = 0,
    called = false;
  const p = createFailover(
    async function* () {
      throw { status: 429 };
    },
    async function* () {
      called = true;
      yield 'bad';
    },
    () => {
      if (++attempts > 1) throw new Error('Budget exhausted');
    },
  );
  await assert.rejects(() => collect(p('x', [], signal())), /Budget/);
  assert.equal(called, false);
});
test('fallback failures propagate, cancellation reaches fallback', async () => {
  const controller = new AbortController();
  const p = createFailover(
    async function* () {
      throw { status: 429 };
    },
    async function* (_m, _h, s) {
      yield 'one';
      controller.abort();
      assert.equal(s.aborted, true);
      throw new Error('aborted');
    },
    () => {},
  );
  await assert.rejects(() => collect(p('x', [], controller.signal)), /aborted/);
});
test('Backboard transport uses knowledge, memory off, stream and deletes one-use state', async () => {
  const keys = [
    'BACKBOARD_API_KEY',
    'BACKBOARD_LLM_PROVIDER',
    'BACKBOARD_MODEL',
    'BACKBOARD_STORAGE_APPROVED',
  ] as const;
  const old = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  Object.assign(process.env, {
    BACKBOARD_API_KEY: 'synthetic-not-a-real-key',
    BACKBOARD_LLM_PROVIDER: 'test',
    BACKBOARD_MODEL: 'synthetic-small',
    BACKBOARD_STORAGE_APPROVED: 'true',
  });
  const seen: { url: string; init?: RequestInit }[] = [];
  const mock: typeof fetch = async (input, init) => {
    const url = String(input);
    seen.push({ url, init });
    if (url.includes('/models?'))
      return Response.json({
        models: [
          {
            name: 'synthetic-small',
            provider: 'test',
            model_type: 'llm',
            input_cost_per_1m_tokens: 0.1,
            output_cost_per_1m_tokens: 0.2,
            context_limit: 16000,
          },
        ],
      });
    if (init?.method === 'DELETE') return Response.json({ deleted: true });
    const event = (data: unknown) => `data: ${JSON.stringify(data)}\n\n`;
    return new Response(
      event({ type: 'user_message', thread_id: 'one-thread', assistant_id: 'one-assistant' }) +
        event({ type: 'run_started', run_id: 'one-run' }) +
        event({ type: 'content_streaming', content: 'Hello' }) +
        event({ type: 'run_ended', status: 'completed' }),
    );
  };
  try {
    assert.equal(
      await collect(createBackboard(mock)('Compare Lolixco in detail', [], signal())),
      'Hello',
    );
    const body = JSON.parse(String(seen.find((s) => s.init?.method === 'POST')!.init!.body));
    assert.equal(body.memory, 'off');
    assert.equal(body.web_search, 'off');
    assert.equal(body.stream, true);
    assert.deepEqual(body.tools, []);
    assert.match(body.system_prompt, /leadership|identities/i);
    assert.ok(
      seen.some((s) => s.url.endsWith('/threads/one-thread') && s.init?.method === 'DELETE'),
    );
    assert.ok(
      seen.some((s) => s.url.endsWith('/assistants/one-assistant') && s.init?.method === 'DELETE'),
    );
  } finally {
    for (const k of keys)
      if (old[k] === undefined) delete process.env[k];
      else process.env[k] = old[k];
  }
});

test('truncated Gemini output is an interruption, not a successful response', async () => {
  const { checkedGeminiChunks } = await import('../server/chat');
  assert.equal(
    await collect(
      checkedGeminiChunks(
        (async function* () {
          yield { text: 'Complete', candidates: [{ finishReason: 'STOP' }] };
        })(),
      ),
    ),
    'Complete',
  );
  await assert.rejects(
    () =>
      collect(
        checkedGeminiChunks(
          (async function* () {
            yield { text: "I'", candidates: [{ finishReason: 'MAX_TOKENS' }] };
          })(),
        ),
      ),
    /interrupted/,
  );
});
