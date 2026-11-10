import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHash } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { getLocalAnswer, systemInstruction, type ChatMessage } from './knowledge.ts';

export const MAX_BODY_BYTES = 20_000;
export const MAX_MESSAGE = 1200;
export type ChatRequest = IncomingMessage & { body?: unknown };
type Provider = (
  message: string,
  history: ChatMessage[],
  signal: AbortSignal,
) => AsyncIterable<string>;
class RequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function validatePayload(body: unknown): { message: string; history: ChatMessage[] } {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new RequestError(400, 'Send a message and optional conversation history.');
  const { message, history = [] } = body as Record<string, unknown>;
  if (typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE)
    throw new RequestError(400, `Messages must contain 1–${MAX_MESSAGE} characters.`);
  if (!Array.isArray(history) || history.length > 12)
    throw new RequestError(400, 'Conversation history must contain at most 12 messages.');
  let total = message.length;
  const validated = history.map((item) => {
    if (
      !item ||
      typeof item !== 'object' ||
      !['user', 'bot'].includes(item.role) ||
      typeof item.text !== 'string' ||
      !item.text.trim() ||
      item.text.length > 2500
    )
      throw new RequestError(400, 'Invalid conversation history.');
    total += item.text.length;
    return { role: item.role, text: item.text } as ChatMessage;
  });
  if (total > 12_000)
    throw new RequestError(
      400,
      'Conversation context is too long. Please start a new conversation.',
    );
  return { message: message.trim(), history: validated };
}

// Bounded, ephemeral instance safeguards. A shared edge firewall rule is still required at scale.
export function createLimiter() {
  const clients = new Map<
    string,
    { minute: number; minuteCount: number; hour: number; hourCount: number }
  >();
  return (identity: string, now = Date.now()) => {
    for (const [key, value] of clients) if (now - value.hour >= 3_600_000) clients.delete(key);
    const key = createHash('sha256').update(identity).digest('hex');
    if (!clients.has(key) && clients.size >= 2000) return false;
    const state = clients.get(key) ?? { minute: now, minuteCount: 0, hour: now, hourCount: 0 };
    if (now - state.minute >= 60_000) {
      state.minute = now;
      state.minuteCount = 0;
    }
    clients.set(key, state);
    return ++state.minuteCount <= 12 && ++state.hourCount <= 120;
  };
}

export async function* geminiStream(message: string, history: ChatMessage[], signal: AbortSignal) {
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    httpOptions: { timeout: 30_000 },
  });
  const stream = await client.models.generateContentStream({
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    contents: [
      ...history.map((h) => ({
        role: h.role === 'bot' ? 'model' : 'user',
        parts: [{ text: h.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ],
    config: { systemInstruction, temperature: 0.2, maxOutputTokens: 1800, abortSignal: signal },
  });
  for await (const chunk of stream) if (chunk.text) yield chunk.text;
}

export function createChatHandler(
  options: {
    provider?: Provider;
    timeoutMs?: number;
    limiter?: ReturnType<typeof createLimiter>;
  } = {},
) {
  const limited = options.limiter ?? createLimiter();
  let active = 0;
  let budgetDay = Math.floor(Date.now() / 86_400_000);
  let providerCalls = 0;
  return async (req: ChatRequest, res: ServerResponse) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const json = (status: number, error: string) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error }));
    };
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      json(405, 'Method not allowed.');
      return;
    }
    if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) {
      json(415, 'Use application/json.');
      return;
    }
    const origin = req.headers.origin;
    const allowedOrigins = new Set(['https://golixco.com', 'https://www.golixco.com']);
    if (process.env.VERCEL_URL) allowedOrigins.add(`https://${process.env.VERCEL_URL}`);
    if (process.env.NODE_ENV !== 'production')
      for (const host of ['localhost', '127.0.0.1'])
        for (const port of ['3000', '3001', '4173']) allowedOrigins.add(`http://${host}:${port}`);
    if ((origin && !allowedOrigins.has(origin)) || req.headers['sec-fetch-site'] === 'cross-site') {
      json(403, 'Please use the Golixco website to chat.');
      return;
    }
    const identity = process.env.VERCEL
      ? String(req.headers['x-vercel-forwarded-for'] || req.socket.remoteAddress || 'unknown')
      : req.socket.remoteAddress || 'local';
    if (!limited(identity)) {
      res.setHeader('Retry-After', '60');
      json(429, 'You have sent several messages. Please wait a minute before trying again.');
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    let counted = false;
    const controller = new AbortController();
    const disconnected = () => {
      if (!res.writableEnded) controller.abort();
    };
    res.on('close', disconnected);
    const event = (data: unknown) => {
      if (!res.destroyed && !res.writableEnded) res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    try {
      if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES)
        throw new RequestError(413, 'Request is too large.');
      let body = req.body;
      if (body === undefined) {
        let bytes = 0;
        const chunks: Buffer[] = [];
        req.setTimeout(10_000, () => {
          if (!res.headersSent) json(408, 'Request took too long.');
          req.destroy();
        });
        for await (const chunk of req) {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          bytes += buffer.length;
          if (bytes > MAX_BODY_BYTES) throw new RequestError(413, 'Request is too large.');
          chunks.push(buffer);
        }
        req.setTimeout(0);
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        } catch {
          throw new RequestError(400, 'The request must contain valid JSON.');
        }
      } else if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES)
        throw new RequestError(413, 'Request is too large.');
      const { message, history } = validatePayload(body);
      const localAnswer = getLocalAnswer(message, history);
      if (!localAnswer && !options.provider && !process.env.GEMINI_API_KEY) {
        json(
          503,
          'Detailed conversation is temporarily unavailable. You can still ask about Golixco, Lolixco, Creator Studio, socials or contact details.',
        );
        return;
      }
      if (!localAnswer) {
        const day = Math.floor(Date.now() / 86_400_000);
        if (budgetDay !== day) {
          budgetDay = day;
          providerCalls = 0;
        }
        if (active >= 4 || providerCalls >= 200) {
          res.setHeader('Retry-After', '60');
          json(429, 'The assistant is busy. Please try again later or contact hello@golixco.com.');
          return;
        }
        active++;
        providerCalls++;
        counted = true;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();
      event({ type: 'start', source: localAnswer ? 'knowledge' : 'gemini' });
      if (localAnswer) {
        event({ type: 'delta', text: localAnswer });
      } else {
        // Promise.race enforces the deadline even if a transport ignores abort.
        const timeout = new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            controller.abort();
            reject(new RequestError(504, 'The response took too long. Please try again.'));
          }, options.timeoutMs ?? 30_000);
        });
        heartbeat = setInterval(() => {
          if (!res.destroyed) res.write(': waiting\n\n');
        }, 5000);
        let chars = 0;
        const consume = async () => {
          for await (const text of (options.provider ?? geminiStream)(
            message,
            history,
            controller.signal,
          )) {
            if (controller.signal.aborted || res.destroyed) break;
            chars += text.length;
            if (chars > 12_000) {
              controller.abort();
              break;
            }
            event({ type: 'delta', text });
          }
          if (!chars && !controller.signal.aborted) throw new Error('Empty response');
        };
        await Promise.race([consume(), timeout]);
      }
      if (!controller.signal.aborted) event({ type: 'done' });
      res.end();
    } catch (error: unknown) {
      if (res.destroyed || res.writableEnded) return;
      const providerStatus = Number((error as { status?: number })?.status);
      const status =
        error instanceof RequestError ? error.status : providerStatus === 429 ? 429 : 502;
      const message =
        error instanceof RequestError
          ? error.message
          : status === 429
            ? 'The assistant has reached its provider quota. Please try again later.'
            : 'The assistant is temporarily unavailable. Please try again or contact hello@golixco.com.';
      // Never log provider bodies, prompts, keys, history, or private configuration.
      if (res.headersSent) {
        event({ type: 'error', error: message });
        res.end();
      } else {
        if (status === 429) res.setHeader('Retry-After', '60');
        json(status, message);
      }
    } finally {
      if (timer) clearTimeout(timer);
      if (heartbeat) clearInterval(heartbeat);
      controller.abort();
      res.off('close', disconnected);
      if (counted) active--;
    }
  };
}
