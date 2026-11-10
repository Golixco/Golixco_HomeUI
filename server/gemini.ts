import { systemInstruction } from './knowledge.ts';
import type { Provider } from './providers.ts';

interface GeminiChunk {
  text?: string;
  error?: { code?: number; status?: string };
  candidates?: {
    finishReason?: string;
    content?: { parts?: { text?: string; thought?: boolean }[] };
  }[];
}
const interrupted = (reason?: string) =>
  Object.assign(new Error('Provider response interrupted'), {
    finishReason: ['MAX_TOKENS', 'SAFETY', 'RECITATION', 'OTHER'].includes(
      reason ?? '',
    )
      ? reason
      : 'UNKNOWN',
  });
export async function* checkedGeminiChunks(stream: AsyncIterable<GeminiChunk>) {
  let finishReason: string | undefined;
  for await (const chunk of stream) {
    // HTTP 200 streams can carry structured errors. Preserve the quota signal before decoding text.
    if (chunk.error) {
      const code = chunk.error.code;
      const status =
        code === 429 || chunk.error.status === 'RESOURCE_EXHAUSTED'
          ? 429
          : typeof code === 'number' && code >= 400 && code <= 599
            ? code
            : 502;
      throw Object.assign(new Error('Gemini request failed'), { status });
    }
    for (const candidate of chunk.candidates ?? []) {
      if (candidate.finishReason) finishReason = candidate.finishReason;
      for (const part of candidate.content?.parts ?? [])
        if (!part.thought && part.text) yield part.text;
    }
    if (chunk.text) yield chunk.text;
  }
  if (finishReason !== 'STOP') throw interrupted(finishReason);
}

export function createGemini(fetcher: typeof fetch = fetch): Provider {
  return async function* (message, history, signal) {
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    const response = await fetcher(
      'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(model) +
        ':streamGenerateContent?alt=sse',
      {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [
            ...history.map((h) => ({
              role: h.role === 'bot' ? 'model' : 'user',
              parts: [{ text: h.text }],
            })),
            { role: 'user', parts: [{ text: message }] },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            thinkingConfig: { thinkingLevel: 'MINIMAL' },
          },
        }),
      },
    );
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      throw Object.assign(new Error('Gemini request failed'), {
        status: response.status,
      });
    }
    if (!response.body) throw interrupted();
    const reader = response.body.getReader();
    async function* frames(): AsyncGenerator<GeminiChunk> {
      const decoder = new TextDecoder();
      let buffer = '',
        bytes = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          bytes += value?.byteLength ?? 0;
          if (bytes > 160000) throw interrupted();
          buffer = (buffer + decoder.decode(value, { stream: !done })).replace(
            /\r\n/g,
            '\n',
          );
          let end: number;
          while ((end = buffer.indexOf('\n\n')) !== -1) {
            const frame = buffer.slice(0, end);
            buffer = buffer.slice(end + 2);
            const data = frame
              .split('\n')
              .filter((l) => l.startsWith('data:'))
              .map((l) => l.slice(5).trim())
              .join('\n');
            if (data && data !== '[DONE]') yield JSON.parse(data);
          }
          if (done) {
            if (buffer.trim()) throw interrupted();
            break;
          }
        }
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
    }
    yield* checkedGeminiChunks(frames());
  };
}
