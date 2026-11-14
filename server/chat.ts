import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  createBackboard,
  backboardConfigured,
  createFailover,
  isQuotaError,
  type Provider,
} from './providers.ts';
import { createHash, randomUUID } from 'node:crypto';
import { createGemini, finishReasons } from './gemini.ts';
export { checkedGeminiChunks } from './gemini.ts';
import { getLocalAnswer, type ChatMessage } from './knowledge.ts';

export const MAX_BODY_BYTES = 20_000;
export const MAX_MESSAGE = 1200;
export type ChatRequest = IncomingMessage & { body?: unknown };
class RequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function validatePayload(body: unknown): {
  message: string;
  history: ChatMessage[];
} {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new RequestError(
      400,
      'Send a message and optional conversation history.',
    );
  const { message, history = [] } = body as Record<string, unknown>;
  if (
    typeof message !== 'string' ||
    !message.trim() ||
    message.length > MAX_MESSAGE
  )
    throw new RequestError(
      400,
      `Messages must contain 1–${MAX_MESSAGE} characters.`,
    );
  if (!Array.isArray(history) || history.length > 12)
    throw new RequestError(
      400,
      'Conversation history must contain at most 12 messages.',
    );
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
    for (const [key, value] of clients)
      if (now - value.hour >= 3_600_000) clients.delete(key);
    const key = createHash('sha256').update(identity).digest('hex');
    if (!clients.has(key) && clients.size >= 2000) return false;
    const state = clients.get(key) ?? {
      minute: now,
      minuteCount: 0,
      hour: now,
      hourCount: 0,
    };
    if (now - state.minute >= 60_000) {
      state.minute = now;
      state.minuteCount = 0;
    }
    clients.set(key, state);
    return ++state.minuteCount <= 12 && ++state.hourCount <= 120;
  };
}

export const geminiStream = createGemini();

export function createChatHandler(
  options: {
    provider?: Provider;
    fallbackProvider?: Provider;
    timeoutMs?: number;
    limiter?: ReturnType<typeof createLimiter>;
  } = {},
) {
  const limited = options.limiter ?? createLimiter();
  let active = 0;
  let budgetDay = Math.floor(Date.now() / 86_400_000);
  let providerCalls = 0;
  const routedProvider = createFailover(
    options.provider ?? geminiStream,
    options.fallbackProvider ??
      (backboardConfigured() ? createBackboard() : undefined),
    () => {
      const day = Math.floor(Date.now() / 86_400_000);
      if (day !== budgetDay) {
        budgetDay = day;
        providerCalls = 0;
      }
      if (providerCalls >= 200)
        throw new RequestError(
          429,
          'The assistant has reached its daily request allowance. Please try again later.',
        );
      providerCalls++;
    },
  );
  return async (req: ChatRequest, res: ServerResponse) => {
    const requestId = randomUUID();
    res.setHeader('X-Request-ID', requestId);
    const diagnose = (
      category: string,
      status: number,
      providerStatus?: number,
      finishReason?: string,
      shape?: {
        packets?: number;
        hasCandidates?: boolean;
        arrayPacket?: boolean;
        blocked?: boolean;
      },
    ) => {
      // Fixed categories only: no URLs, bodies, IPs, provider errors or conversation text.
      console.info(
        JSON.stringify({
          event: 'chat_request',
          requestId,
          category,
          status,
          ...(providerStatus && providerStatus >= 400 && providerStatus <= 599
            ? { providerStatus }
            : {}),
          ...(finishReason && finishReasons.has(finishReason)
            ? { finishReason }
            : {}),
          ...(shape &&
          Number.isInteger(shape.packets) &&
          shape.packets! >= 0 &&
          shape.packets! <= 10000
            ? {
                packets: shape.packets,
                hasCandidates: shape.hasCandidates === true,
                arrayPacket: shape.arrayPacket === true,
                blocked: shape.blocked === true,
              }
            : {}),
        }),
      );
    };
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const json = (
      status: number,
      error: string,
      category = status === 503
        ? 'configuration_unavailable'
        : 'request_rejected',
    ) => {
      diagnose(category, status);
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error }));
    };
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      json(405, 'Method not allowed.');
      return;
    }
    if (
      !req.headers['content-type']?.toLowerCase().startsWith('application/json')
    ) {
      json(415, 'Use application/json.');
      return;
    }
    const origin = req.headers.origin;
    const allowedOrigins = new Set([
      'https://golixco.com',
      'https://www.golixco.com',
    ]);
    if (process.env.VERCEL_URL)
      allowedOrigins.add(`https://${process.env.VERCEL_URL}`);
    if (process.env.NODE_ENV !== 'production')
      for (const host of ['localhost', '127.0.0.1'])
        for (const port of ['3000', '3001', '4173'])
          allowedOrigins.add(`http://${host}:${port}`);
    if (
      (origin && !allowedOrigins.has(origin)) ||
      req.headers['sec-fetch-site'] === 'cross-site'
    ) {
      json(403, 'Please use the Golixco website to chat.');
      return;
    }
    const identity = process.env.VERCEL
      ? String(
          req.headers['x-vercel-forwarded-for'] ||
            req.socket.remoteAddress ||
            'unknown',
        )
      : req.socket.remoteAddress || 'local';
    if (!limited(identity)) {
      res.setHeader('Retry-After', '60');
      json(
        429,
        'You have sent several messages. Please wait a minute before trying again.',
      );
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
      if (!res.destroyed && !res.writableEnded)
        res.write(`data: ${JSON.stringify(data)}\n\n`);
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
          if (bytes > MAX_BODY_BYTES)
            throw new RequestError(413, 'Request is too large.');
          chunks.push(buffer);
        }
        req.setTimeout(0);
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        } catch {
          throw new RequestError(400, 'The request must contain valid JSON.');
        }
      } else if (
        Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES
      )
        throw new RequestError(413, 'Request is too large.');
      const { message, history } = validatePayload(body);
      const preferAI = Boolean(options.provider || process.env.GEMINI_API_KEY);
      const localAnswer = getLocalAnswer(message, history, { preferAI });
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
          json(
            429,
            'The assistant is busy. Please try again later or contact hello@golixco.com.',
          );
          return;
        }
        active++;
        counted = true;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();
      event({ type: 'start', source: localAnswer ? 'knowledge' : 'gemini' });
      let answer = localAnswer;
      let usedFallback = false;
      if (!answer) {
        // Promise.race enforces the deadline even if a transport ignores abort.
        const timeout = new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            controller.abort();
            reject(
              new RequestError(
                504,
                'The response took too long. Please try again.',
              ),
            );
          }, options.timeoutMs ?? 30_000);
        });
        heartbeat = setInterval(() => {
          if (!res.destroyed) res.write(': waiting\n\n');
        }, 5000);
        const consume = async () => {
          let text = '';
          for await (const chunk of routedProvider(
            message,
            history,
            controller.signal,
            () => {
              usedFallback = true;
            },
          )) {
            if (controller.signal.aborted || res.destroyed) return;
            text += chunk;
            if (text.length > 12_000)
              throw new Error('Provider answer exceeded output limit');
          }
          if (!text.trim() && !controller.signal.aborted)
            throw new Error('Empty response');
          return text;
        };
        answer = await Promise.race([consume(), timeout]);
      }
      if (!controller.signal.aborted && answer) {
        event({ type: 'delta', text: answer });
        event({ type: 'done' });
        diagnose(
          localAnswer ? 'curated_complete' : usedFallback ? 'backboard_complete' : 'model_complete',
          200,
        );
      } else diagnose('cancelled', 499);
      res.end();
    } catch (error: unknown) {
      if (res.destroyed || res.writableEnded) return;
      const providerStatus = Number((error as { status?: number })?.status);
      const finishReason = (error as { finishReason?: string })?.finishReason;
      const contentStopped =
        finishReason === 'PROHIBITED_CONTENT' ||
        finishReason === 'SAFETY' ||
        finishReason === 'BLOCKLIST' ||
        finishReason === 'SPII';
      const status =
        error instanceof RequestError
          ? error.status
          : isQuotaError(error)
            ? 429
            : 502;
      const message =
        error instanceof RequestError
          ? error.message
          : status === 429
            ? 'The assistant has reached its provider quota. Please try again later.'
            : contentStopped
              ? 'The assistant couldn’t complete that answer. Try asking a more specific question about Golixco or Lolixco.'
              : 'The assistant is temporarily unavailable. Please try again or contact hello@golixco.com.';
      // Never log provider bodies, prompts, keys, history, or private configuration.
      const category =
        status === 504
          ? 'timeout'
          : status === 429
            ? 'quota_or_limit'
            : error instanceof RequestError
              ? 'invalid_request'
              : providerStatus === 401 || providerStatus === 403
                ? 'provider_access'
                : providerStatus === 404
                  ? 'provider_model_unavailable'
                  : providerStatus === 503
                    ? 'provider_unavailable'
                    : providerStatus === 400
                      ? 'provider_request_rejected'
                      : error instanceof TypeError
                        ? 'provider_network'
                        : contentStopped
                          ? 'provider_content_stopped'
                          : error instanceof Error && error.message === 'Provider response interrupted'
                            ? 'provider_interrupted'
                            : 'provider_failure';
      if (res.headersSent) {
        diagnose(
          category,
          status,
          providerStatus,
          finishReason,
          error as {
            packets?: number;
            hasCandidates?: boolean;
            arrayPacket?: boolean;
            blocked?: boolean;
          },
        );
        event({ type: 'error', error: message });
        res.end();
      } else {
        if (status === 429) res.setHeader('Retry-After', '60');
        json(status, message, category);
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
