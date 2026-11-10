import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  Rocket,
  Loader2,
  Square,
  RotateCcw,
} from 'lucide-react';
import { RevealContainer, RevealItem } from './ScrollReveal';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { BrandName } from './BrandName';
import { safeOfficialLink } from '../../shared/official';

const ReactMarkdown = lazy(() => import('react-markdown'));
interface Message {
  role: 'user' | 'bot';
  text: string;
  failed?: boolean;
}
const questions = [
  { label: 'What is Golixco?', question: 'What is Golixco?', icon: Sparkles },
  { label: 'Meet Lolixco', question: 'What is Lolixco?', icon: Rocket },
  { label: 'Creator Studio', question: 'Explain Creator Studio.', icon: Zap },
  { label: 'Our mission', question: 'What is the mission of Golixco?', icon: Target },
];

export function HeroSection() {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const followScroll = useRef(true);
  const reduced = useReducedMotion();
  const showRotatingName = !isFocused && !inputValue && !messages.length;

  useEffect(() => {
    if (chatRef.current && followScroll.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isLoading, error]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const handleSend = async (text = inputValue) => {
    if (!text.trim() || text.length > 1200 || loadingRef.current) return;
    loadingRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    const userMessage = text.trim();
    const history = messages
      .filter((m) => !m.failed && m.text)
      .slice(-8)
      .map(({ role, text }) => ({ role, text: text.slice(0, 2000) }));
    // Retain a small request context; the visible conversation can be longer.
    while (history.reduce((n, m) => n + m.text.length, userMessage.length) > 10_000)
      history.shift();
    const botIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userMessage },
      { role: 'bot', text: '' },
    ]);
    setInputValue('');
    setIsLoading(true);
    setError('');
    setStatus('Thinking…');
    followScroll.current = true;
    let finished = false;
    let receivedText = false;
    const timer = setTimeout(() => controller.abort('timeout'), 40_000);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ message: userMessage, history }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error || 'The assistant is temporarily unavailable. Please try again.',
        );
      }
      if (!response.body)
        throw new Error('Streaming is unavailable in this browser. Please try another browser.');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const acceptEvent = (frame: string) => {
        const data = frame
          .split('\n')
          .filter((line) => line.startsWith('data: '))
          .map((line) => line.slice(6))
          .join('\n');
        if (!data) return;
        const event = JSON.parse(data);
        if (event.type === 'delta' && typeof event.text === 'string') {
          receivedText = true;
          setStatus('Responding…');
          setMessages((prev) =>
            prev.map((m, i) => (i === botIndex ? { ...m, text: m.text + event.text } : m)),
          );
        }
        if (event.type === 'error')
          throw new Error(event.error || 'The response was interrupted. Please try again.');
        if (event.type === 'done') finished = true;
      };
      try {
        while (true) {
          const { done, value } = await reader.read();
          buffer += decoder.decode(value, { stream: !done });
          let end: number;
          while ((end = buffer.indexOf('\n\n')) !== -1) {
            const frame = buffer.slice(0, end);
            buffer = buffer.slice(end + 2);
            acceptEvent(frame);
          }
          if (done) break;
        }
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
      if (!finished || !receivedText)
        throw new Error('The response was interrupted. Please try again.');
      setStatus('Response complete');
    } catch (err) {
      const stopped = controller.signal.aborted;
      const message = stopped
        ? controller.signal.reason === 'timeout'
          ? 'The response took too long. Please try again.'
          : 'Response stopped.'
        : err instanceof Error
          ? err.message
          : 'Connection interrupted. Please try again.';
      setError(message);
      setStatus(message);
      setMessages((prev) => prev.map((m, i) => (i === botIndex ? { ...m, failed: true } : m)));
    } finally {
      clearTimeout(timer);
      setIsLoading(false);
      loadingRef.current = false;
      abortRef.current = null;
    }
  };
  const clearChat = () => {
    setMessages([]);
    setError('');
    setStatus('Conversation cleared');
    inputRef.current?.focus();
  };

  return (
    <section
      id="ask"
      aria-labelledby="hero-heading"
      className="min-h-[80svh] flex flex-col items-center justify-center pt-32 pb-16 px-4 relative z-10 scroll-mt-24"
    >
      <RevealContainer viewportMargin="0px" className="w-full max-w-3xl flex flex-col items-center">
        <div aria-hidden="true" className="h-4 mb-6" />
        <RevealItem>
          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-[clamp(2rem,3.3vw,3rem)] md:whitespace-nowrap font-bold mb-5 tracking-tight text-center text-white leading-[1.15]"
          >
            What would you like to know about <span className="sr-only">Golixco?</span>
          </h1>
        </RevealItem>
        <div aria-hidden="true" className="h-5 mb-9" />
        <RevealItem className="w-full max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="relative flex items-center bg-[#0E0E0E] rounded-2xl border border-white/10 focus-within:border-white/35 focus-within:shadow-[0_0_32px_rgba(255,255,255,0.04)] transition-all duration-300"
          >
            <BrandName paused={!showRotatingName} />
            <label htmlFor="company-question" className="sr-only">
              Ask about Golixco or Lolixco
            </label>
            <input
              ref={inputRef}
              id="company-question"
              type="text"
              autoComplete="off"
              maxLength={1200}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={showRotatingName ? '' : 'Ask about Golixco or Lolixco…'}
              className="w-full min-w-0 bg-transparent text-white pl-5 pr-16 py-5 outline-none rounded-2xl text-base placeholder:text-white/35"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                aria-label="Stop response"
                className="absolute right-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim()}
                aria-label="Send question"
                className="absolute right-3 p-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </form>
          <p className="text-[11px] text-white/30 mt-3 text-center">AI can make mistakes</p>
        </RevealItem>
        {!messages.length ? (
          <RevealItem className="w-full flex flex-wrap justify-center gap-2 mt-6">
            {questions.map(({ label, question, icon: Icon }) => (
              <button
                key={label}
                onClick={() => {
                  setInputValue(question);
                  inputRef.current?.focus();
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-full border border-white/[0.08] bg-[#090909] hover:bg-white/[0.06] hover:border-white/25 transition-colors text-xs sm:text-sm text-white/70 hover:text-white"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </RevealItem>
        ) : (
          <div className="w-full max-w-2xl mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-[0.15em] text-white/40">
                Golixco assistant
              </span>
              <button
                disabled={isLoading}
                onClick={clearChat}
                className="flex gap-1.5 items-center p-2 text-xs text-white/55 hover:text-white disabled:opacity-30"
              >
                <RotateCcw className="w-3 h-3" />
                New chat
              </button>
            </div>
            <div
              ref={chatRef}
              role="log"
              aria-label="Conversation with Golixco"
              aria-busy={isLoading}
              tabIndex={0}
              onScroll={(e) => {
                const el = e.currentTarget;
                followScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
              }}
              className="flex flex-col gap-4 max-h-[min(52svh,520px)] overflow-y-auto overscroll-contain pr-2 pb-2"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.15) transparent',
              }}
            >
              {messages.map((msg, idx) =>
                msg.text || (isLoading && idx === messages.length - 1) ? (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: reduced ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`min-w-0 max-w-[95%] sm:max-w-[90%] px-4 sm:px-5 py-4 rounded-2xl text-sm leading-relaxed break-words [overflow-wrap:anywhere] ${msg.role === 'user' ? 'bg-white/10 text-white rounded-br-sm whitespace-pre-wrap' : 'chat-markdown bg-[#090909] border border-white/[0.08] text-white/85 rounded-bl-sm'}`}
                    >
                      <span className="sr-only">
                        {msg.role === 'user' ? 'You: ' : 'Golixco assistant: '}
                      </span>
                      {!msg.text ? (
                        <span className="flex items-center gap-2 text-white/50">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Thinking…
                        </span>
                      ) : msg.role === 'user' ? (
                        msg.text
                      ) : (
                        <Suspense
                          fallback={<span className="whitespace-pre-wrap">{msg.text}</span>}
                        >
                          <ReactMarkdown
                            skipHtml
                            urlTransform={(url) => safeOfficialLink(url) || ''}
                            components={{
                              a: ({ href, children }) =>
                                href ? (
                                  <a
                                    href={href}
                                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                                    rel="noopener noreferrer"
                                  >
                                    {children}
                                  </a>
                                ) : (
                                  <span>{children}</span>
                                ),
                              img: () => null,
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </Suspense>
                      )}
                      {msg.failed && msg.text && (
                        <p className="text-xs text-white/45 mt-3">Response interrupted</p>
                      )}
                    </div>
                  </motion.div>
                ) : null,
              )}
            </div>
            {error && (
              <p
                role="alert"
                className="text-sm text-white/65 border border-white/10 rounded-xl p-3 mt-3"
              >
                {error}
              </p>
            )}
            {isLoading && (
              <p aria-hidden="true" className="text-xs text-white/45 mt-3">
                {status}{' '}
                <button
                  type="button"
                  className="underline ml-2"
                  onClick={() => abortRef.current?.abort()}
                >
                  Stop
                </button>
              </p>
            )}
          </div>
        )}
        <span role="status" aria-live="polite" className="sr-only">
          {status}
        </span>
      </RevealContainer>
    </section>
  );
}
