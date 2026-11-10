// Optional, read-only authenticated catalog audit in Vercel's build environment.
// Enable explicitly with --build-env GOLIXCO_CHECK_PROVIDERS=1. Never generate or change config.
import { readProviderCatalog } from '../server/backboard-catalog.ts';
if (process.env.GOLIXCO_CHECK_PROVIDERS === '1') {
  console.log(
    JSON.stringify({
      event: 'provider_preflight',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      geminiModelMatchesExpected:
        process.env.GEMINI_MODEL === 'gemini-3.5-flash-lite',
      backboardConfigured: !!process.env.BACKBOARD_API_KEY,
      backboardProviderMatchesExpected:
        process.env.BACKBOARD_LLM_PROVIDER === 'openrouter',
      backboardModelMatchesExpected:
        process.env.BACKBOARD_MODEL === 'google/gemma-3-27b-it',
      storageApproved: process.env.BACKBOARD_STORAGE_APPROVED === 'true',
    }),
  );
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL) {
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' +
          encodeURIComponent(process.env.GEMINI_MODEL),
        {
          headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY },
          signal: AbortSignal.timeout(10000),
        },
      );
      console.log(
        JSON.stringify({
          event: 'gemini_model_access',
          status: response.status,
          accessible: response.ok,
        }),
      );
    } catch {
      console.log(
        JSON.stringify({
          event: 'gemini_model_access',
          accessible: false,
          category: 'network',
        }),
      );
    }
  }
  if (process.env.BACKBOARD_API_KEY && process.env.BACKBOARD_LLM_PROVIDER) {
    try {
      const models = await readProviderCatalog(
        process.env.BACKBOARD_LLM_PROVIDER,
        { 'X-API-Key': process.env.BACKBOARD_API_KEY },
        AbortSignal.timeout(20000),
      );
      console.log(
        JSON.stringify({
          event: 'backboard_catalog',
          authenticated: true,
          requestedFound: models.some(
            (m) => m.name === process.env.BACKBOARD_MODEL,
          ),
          candidates: models
            .filter(
              (m) =>
                m.name === process.env.BACKBOARD_MODEL ||
                /gemma.*(?:27b|12b)/i.test(m.name),
            )
            .map((m) => ({
              name: m.name,
              provider: m.provider,
              type: m.model_type,
              context: m.context_limit,
              inputUSDperMillion: m.input_cost_per_1m_tokens,
              outputUSDperMillion: m.output_cost_per_1m_tokens,
              streaming:
                m.supports_streaming ??
                'not advertised; requires synthetic stream verification',
            })),
        }),
      );
    } catch {
      console.log(
        JSON.stringify({
          event: 'backboard_catalog',
          authenticated: false,
          category: 'catalog_unavailable',
        }),
      );
    }
  }
}
