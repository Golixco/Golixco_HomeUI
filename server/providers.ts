import { readProviderCatalog } from './backboard-catalog.ts';
import { systemInstruction, type ChatMessage } from './knowledge.ts';
export type Provider = (
  message: string,
  history: ChatMessage[],
  signal: AbortSignal,
) => AsyncIterable<string>;
export function isQuotaError(error: unknown): boolean {
  const e = error as {
    status?: unknown;
    code?: unknown;
    error?: { status?: unknown; code?: unknown };
  };
  return (
    e?.status === 429 ||
    e?.code === 429 ||
    e?.code === 'RESOURCE_EXHAUSTED' ||
    e?.status === 'RESOURCE_EXHAUSTED' ||
    e?.error?.status === 'RESOURCE_EXHAUSTED' ||
    e?.error?.code === 429
  );
}
export function createFailover(
  primary: Provider,
  fallback: Provider | undefined,
  attempt: () => void,
  now = Date.now,
) {
  let quotaUntil = 0;
  return async function* (
    message: string,
    history: ChatMessage[],
    signal: AbortSignal,
    onFallback?: () => void,
  ) {
    let emitted = false;
    if (now() < quotaUntil && !fallback) throw { status: 429 };
    if (now() >= quotaUntil) {
      attempt();
      try {
        for await (const text of primary(message, history, signal)) {
          if (signal.aborted) return;
          if (text) {
            emitted = true;
            yield text;
          }
        }
        return;
      } catch (error) {
        if (signal.aborted) throw error;
        const quotaError = isQuotaError(error);
        if (quotaError) quotaUntil = now() + 60_000;
        if (quotaError && emitted) throw new Error('Response interrupted');
        const unavailable = (error as { status?: unknown })?.status === 503;
        if (!fallback || emitted || (!quotaError && !unavailable)) throw error;
      }
    }
    if (signal.aborted) return;
    attempt();
    onFallback?.();
    yield* fallback!(message, history, signal);
  };
}
const BASE = 'https://app.backboard.io/api';
export const backboardConfigured = () =>
  Boolean(
    process.env.BACKBOARD_API_KEY &&
    process.env.BACKBOARD_LLM_PROVIDER &&
    process.env.BACKBOARD_MODEL &&
    process.env.BACKBOARD_STORAGE_APPROVED === 'true',
  );
export function createBackboard(fetcher: typeof fetch = fetch): Provider {
  return async function* (message, history, signal) {
    if (!backboardConfigured()) throw new Error('Fallback unavailable');
    const headers = {
      'X-API-Key': process.env.BACKBOARD_API_KEY!,
      'Content-Type': 'application/json',
    };
    let threadId: string | undefined,
      assistantId: string | undefined,
      runId: string | undefined,
      complete = false;
    const cleanup = async (path: string, method = 'DELETE') => {
      const r = await fetcher(BASE + path, { method, headers, signal: AbortSignal.timeout(3000) });
      if (!r.ok) throw new Error('Cleanup failed');
    };
    try {
      // Fail closed unless the selected model has known economical pricing and adequate context.
      const catalog = await readProviderCatalog(
        process.env.BACKBOARD_LLM_PROVIDER!,
        headers,
        signal,
        fetcher,
      );
      const model = catalog.find((m) => m.name === process.env.BACKBOARD_MODEL);
      if (!model) throw new Error('Selected model is unavailable in the account catalog');
      if (
        model.provider !== process.env.BACKBOARD_LLM_PROVIDER ||
        model.model_type !== 'llm' ||
        model.supports_streaming === false ||
        typeof model.input_cost_per_1m_tokens !== 'number' ||
        typeof model.output_cost_per_1m_tokens !== 'number' ||
        !Number.isFinite(model.input_cost_per_1m_tokens) ||
        !Number.isFinite(model.output_cost_per_1m_tokens) ||
        model.input_cost_per_1m_tokens < 0 ||
        model.output_cost_per_1m_tokens < 0 ||
        model.input_cost_per_1m_tokens > 0.5 ||
        model.output_cost_per_1m_tokens > 1 ||
        !Number.isFinite(model.context_limit) ||
        model.context_limit < 8192
      )
        throw new Error('Model outside approved cost/context bounds');
      const response = await fetcher(BASE + '/threads/messages', {
        method: 'POST',
        headers,
        signal,
        body: JSON.stringify({
          content: JSON.stringify({
            untrusted_recent_context: history.slice(-4),
            question: message,
          }),
          system_prompt: systemInstruction,
          llm_provider: process.env.BACKBOARD_LLM_PROVIDER,
          model_name: process.env.BACKBOARD_MODEL,
          stream: true,
          memory: 'off',
          web_search: 'off',
          tools: [],
          image_generation: 'off',
          video_generation: 'off',
        }),
      });
      if (!response.ok || !response.body)
        throw Object.assign(new Error('Fallback unavailable'), { status: response.status });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let bytes = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, '\n');
          bytes += value?.byteLength ?? 0;
          if (bytes > 160_000) throw new Error('Invalid provider response');
          let end: number;
          while ((end = buffer.indexOf('\n\n')) !== -1) {
            const frame = buffer.slice(0, end);
            buffer = buffer.slice(end + 2);
            const raw = frame
              .split('\n')
              .filter((l) => l.startsWith('data:'))
              .map((l) => l.slice(5).trim())
              .join('\n');
            if (!raw) continue;
            const event = JSON.parse(raw);
            if (event.thread_id) threadId = event.thread_id;
            if (event.assistant_id) assistantId = event.assistant_id;
            if (event.run_id) runId = event.run_id;
            if (event.type === 'content_streaming' && typeof event.content === 'string')
              yield event.content;
            if (
              event.type === 'run_failed' ||
              event.type === 'error' ||
              event.type === 'tool_submit_required'
            )
              throw new Error('Fallback interrupted');
            if (event.type === 'run_ended') {
              if (event.status && event.status !== 'completed')
                throw new Error('Fallback incomplete');
              complete = true;
            }
          }
          if (done) break;
        }
        if (!complete) throw new Error('Fallback incomplete');
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
    } finally {
      // A fresh, non-reused thread/assistant for each fallback. Cleanup gets its own short deadline.
      // Failure is observable as a generic response error; no claims of guaranteed zero retention.
      const cleanupCalls: Promise<void>[] = [];
      if (threadId && !complete && runId)
        await cleanup(
          `/threads/${encodeURIComponent(threadId)}/runs/${encodeURIComponent(runId)}/cancel`,
          'POST',
        ).catch(() => {});
      if (threadId) cleanupCalls.push(cleanup(`/threads/${encodeURIComponent(threadId)}`));
      if (assistantId) cleanupCalls.push(cleanup(`/assistants/${encodeURIComponent(assistantId)}`));
      const cleanupResults = await Promise.allSettled(cleanupCalls);
      if (cleanupResults.some((r) => r.status === 'rejected'))
        throw new Error('Provider cleanup incomplete');
    }
  };
}
