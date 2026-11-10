import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readProviderCatalog } from '../server/backboard-catalog';
test('slash-containing Gemma identifiers are catalog values, not decoded path segments', async () => {
  let calls = 0;
  const fetcher: typeof fetch = async (url) => {
    calls++;
    const parsed = new URL(String(url));
    assert.equal(parsed.pathname, '/api/models');
    assert.equal(parsed.searchParams.get('provider'), 'openrouter');
    return Response.json({
      models: [
        {
          name: 'google/gemma-3-27b-it',
          provider: 'openrouter',
          model_type: 'llm',
          context_limit: 128000,
          input_cost_per_1m_tokens: 0.1,
          output_cost_per_1m_tokens: 0.2,
        },
      ],
    });
  };
  const models = await readProviderCatalog('openrouter', {}, new AbortController().signal, fetcher);
  assert.equal(models[0].name, 'google/gemma-3-27b-it');
  assert.equal(calls, 1);
});
test('catalog failure does not claim availability or select a replacement', async () => {
  await assert.rejects(
    () =>
      readProviderCatalog(
        'openrouter',
        {},
        new AbortController().signal,
        async () => new Response('', { status: 401 }),
      ),
    /401/,
  );
});
