// Read-only model discovery; never prints credentials or enables visitor traffic.
try {
  process.loadEnvFile('.env.local');
} catch {}
const key = process.env.BACKBOARD_API_KEY;
if (!key) {
  console.error('Set BACKBOARD_API_KEY privately in .env.local first.');
  process.exit(1);
}
const r = await fetch('https://app.backboard.io/api/models?model_type=llm&limit=500', {
  headers: { 'X-API-Key': key },
  signal: AbortSignal.timeout(15000),
});
if (!r.ok) {
  console.error(`Catalog unavailable (HTTP ${r.status}); no model selected.`);
  process.exit(1);
}
const data = await r.json();
const candidates = data.models
  .filter(
    (m) =>
      m.context_limit >= 8192 &&
      typeof m.input_cost_per_1m_tokens === 'number' &&
      typeof m.output_cost_per_1m_tokens === 'number' &&
      m.input_cost_per_1m_tokens <= 0.5 &&
      m.output_cost_per_1m_tokens <= 1,
  )
  .sort(
    (a, b) =>
      a.input_cost_per_1m_tokens * 4000 +
      a.output_cost_per_1m_tokens * 300 -
      (b.input_cost_per_1m_tokens * 4000 + b.output_cost_per_1m_tokens * 300),
  );
console.table(
  candidates
    .slice(0, 15)
    .map((m) => ({
      provider: m.provider,
      model: m.name,
      context: m.context_limit,
      inputUSDperM: m.input_cost_per_1m_tokens,
      outputUSDperM: m.output_cost_per_1m_tokens,
      estimatedUSD4000in300out:
        (m.input_cost_per_1m_tokens * 4000 + m.output_cost_per_1m_tokens * 300) / 1e6,
    })),
);
console.log(
  'This is the first catalog page only. Review pagination, quality, stream behavior and retention approval before choosing a model. No model was enabled.',
);
