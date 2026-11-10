/** Provider-filtered lookup supports identifiers containing '/', without path-decoding ambiguity. */
export interface CatalogModel {
  name: string;
  provider: string;
  model_type: string;
  context_limit: number;
  input_cost_per_1m_tokens: number;
  output_cost_per_1m_tokens: number;
  max_output_tokens?: number;
  supports_streaming?: boolean;
}
export async function readProviderCatalog(
  provider: string,
  headers: Record<string, string>,
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<CatalogModel[]> {
  const all: CatalogModel[] = [];
  for (let skip = 0; skip < 10000; skip += 500) {
    const query = new URLSearchParams({
      model_type: 'llm',
      provider,
      skip: String(skip),
      limit: '500',
    });
    const response = await fetcher(`https://app.backboard.io/api/models?${query}`, {
      headers,
      signal,
    });
    if (!response.ok) throw new Error(`Catalog unavailable (HTTP ${response.status})`);
    const data = await response.json();
    if (!Array.isArray(data.models)) throw new Error('Invalid catalog response');
    all.push(...data.models.filter((m: CatalogModel) => m.provider === provider));
    if (data.models.length < 500) return all;
  }
  throw new Error('Catalog pagination safety limit reached; no model selected');
}
