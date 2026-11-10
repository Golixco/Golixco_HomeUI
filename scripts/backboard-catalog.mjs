// Read-only discovery. Node 24 can import this type-strippable helper directly.
import { readProviderCatalog } from '../server/backboard-catalog.ts';
try {
  process.loadEnvFile('.env.local');
} catch {}
if (!process.env.BACKBOARD_API_KEY) {
  console.error('Set BACKBOARD_API_KEY privately in .env.local first.');
  process.exit(1);
}
const provider = process.env.BACKBOARD_LLM_PROVIDER || 'openrouter';
const requested = process.env.BACKBOARD_MODEL || 'google/gemma-3-27b-it';
try {
  const models = await readProviderCatalog(
    provider,
    { 'X-API-Key': process.env.BACKBOARD_API_KEY },
    AbortSignal.timeout(30000),
  );
  const candidates = models.filter(
    (m) => m.name === requested || /gemma.*(?:27b|12b)/i.test(m.name),
  );
  console.table(
    candidates.map((m) => ({
      provider: m.provider,
      model: m.name,
      requested: m.name === requested,
      context: m.context_limit,
      maxOutput: m.max_output_tokens,
      inputUSDperM: m.input_cost_per_1m_tokens,
      outputUSDperM: m.output_cost_per_1m_tokens,
      streaming: m.supports_streaming ?? 'not stated: verify with one synthetic stream',
      withinLimits:
        m.model_type === 'llm' &&
        m.context_limit >= 8192 &&
        Number.isFinite(m.input_cost_per_1m_tokens) &&
        m.input_cost_per_1m_tokens >= 0 &&
        m.input_cost_per_1m_tokens <= 0.5 &&
        Number.isFinite(m.output_cost_per_1m_tokens) &&
        m.output_cost_per_1m_tokens >= 0 &&
        m.output_cost_per_1m_tokens <= 1 &&
        m.supports_streaming !== false,
      estimatedUSD4000in300out:
        (m.input_cost_per_1m_tokens * 4000 + m.output_cost_per_1m_tokens * 300) / 1e6,
    })),
  );
  console.log(
    models.some((m) => m.name === requested)
      ? 'Requested identifier found. Review compatibility and limits above.'
      : 'Requested identifier unavailable. Review supported 12B candidates above; no replacement selected.',
  );
  console.log(
    'All provider pages checked (10,000-model safety limit). No generation, configuration change or model auto-selection performed.',
  );
} catch {
  console.error(
    'Authenticated catalog verification failed; no model selected. Check the key/account and try again.',
  );
  process.exitCode = 1;
}
