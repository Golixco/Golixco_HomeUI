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
  failure?: string;
}
const questions = [
  { label: 'What is Golixco?', question: 'What is Golixco?', icon: Sparkles },
  { label: 'Meet Lolixco', question: 'What is Lolixco?', icon: Rocket },
  { label: 'Creator Studio', question: 'Explain Creator Studio.', icon: Zap },
  { label: 'Our mission', question: 'What is the mission of Golixco?', icon: Target },
];

export function HeroSection() {
  const [chatReady, setChatReady] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
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
  }, [messages, isLoading]);
  useEffect(() => {
    setChatReady(true);
    return () => abortRef.current?.abort();
  }, []);

  const handleSend = async (text = inputValue, retry = false) => {
    if (!text.trim() || text.length > 1200 || loadingRef.current) return;
    loadingRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    const userMessage = text.trim();
    const prior = retry ? messages.slice(0, -2) : messages;
    const history = prior
      .filter((m, i) => m.text && !m.failure && (m.role !== 'user' || !prior[i + 1]?.failure))
      .slice(-8)
      .map(({ role, text }) => ({ role, text: text.slice(0, 2000) }));
    // Retain a small request context; the visible conversation can be longer.
    while (history.reduce((n, m) => n + m.text.length, userMessage.length) > 10_000)
      history.shift();
    const botIndex = prior.length + 1;
    setMessages([
      ...prior,
      { role: 'user', text: userMessage },
      { role: 'bot', text: '' },
    ]);
    if (!retry) setInputValue('');
    setIsLoading(true);
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
      setStatus(message);
      setMessages((prev) => prev.map((m, i) => (i === botIndex ? { ...m, failure: message } : m)));
    } finally {
      clearTimeout(timer);
      setIsLoading(false);
      loadingRef.current = false;
      abortRef.current = null;
    }
  };
  const clearChat = () => {
    setMessages([]);
    setStatus('Conversation cleared');
    inputRef.current?.focus();
  };

  return (
    <section
      id="ask"
      aria-labelledby="hero-heading"
      className="min-h-[85svh] flex flex-col items-center justify-center pt-28 pb-16 px-4 relative z-10 scroll-mt-24 overflow-hidden"
    >
      {/* Background G watermark from reference */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none overflow-hidden"
      >
        <span className="font-pixel text-[32rem] sm:text-[40rem] leading-none text-white">G</span>
      </div>

      <RevealContainer viewportMargin="0px" className="w-full max-w-3xl flex flex-col items-center relative z-10">
        <RevealItem>
          <div className="text-center mb-6">
            <h1
              id="hero-heading"
              className="font-pixel text-5xl sm:text-6xl md:text-7xl mb-3 tracking-wider text-white"
            >
              GolixcoBot
            </h1>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
              Hi, I am GolixcoBot, Golixco&apos;s AI assistant. Ask me anything about our company, products, Creator Studio, or vision.
            </p>
          </div>
        </RevealItem>
        <RevealItem className="w-full max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="relative flex items-center bg-[#1a1a1a] rounded-full border border-white/20 focus-within:border-white/40 focus-within:shadow-[0_0_32px_rgba(255,255,255,0.06)] transition-all duration-300"
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
              disabled={!chatReady}
              maxLength={1200}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={showRotatingName ? '' : 'Ask about Golixco or Lolixco…'}
              className="w-full min-w-0 bg-transparent text-white pl-6 pr-14 py-4 outline-none rounded-full text-base placeholder:text-gray-500"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                aria-label="Stop response"
                className="absolute right-2 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <Square className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!chatReady || !inputValue.trim()}
                aria-label="Send question"
                className="absolute right-2 p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 disabled:cursor-not-allowed rounded-full transition-colors"
              >
                <ArrowRight className="w-4 h-4 text-white" />
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
                disabled={!chatReady}
                onClick={() => {
                  setInputValue(question);
                  inputRef.current?.focus();
                }}
                className="text-xs md:text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </RevealItem>
        ) : (
          <div className="w-full max-w-2xl mt-6 bg-[#111] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
              <span className="font-pixel text-lg tracking-wider text-gray-400">
                GolixcoBot
              </span>
              <button
                disabled={isLoading}
                onClick={clearChat}
                className="flex gap-1.5 items-center px-2 py-1 text-xs text-white/55 hover:text-white hover:bg-white/5 rounded-lg disabled:opacity-30 transition-colors"
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
              className="flex flex-col gap-4 max-h-[min(52svh,520px)] overflow-y-auto overscroll-contain pr-2 pb-2 custom-scrollbar"
            >
              {messages.map((msg, idx) =>
                msg.text || msg.failure || (isLoading && idx === messages.length - 1) ? (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: reduced ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`min-w-0 max-w-[90%] sm:max-w-[85%] px-4 sm:px-5 py-3 rounded-2xl text-sm leading-relaxed break-words [overflow-wrap:anywhere] ${msg.role === 'user' ? 'bg-white/10 text-white rounded-tr-sm whitespace-pre-wrap' : 'chat-markdown bg-[#1a1a1a] border border-white/10 text-gray-300 rounded-tl-sm'}`}
                    >
                      <span className="sr-only">
                        {msg.role === 'user' ? 'You: ' : 'Golixco assistant: '}
                      </span>
                      {!msg.text && !msg.failure ? (
                        <span className="flex items-center gap-2 text-white/50">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Thinking…
                        </span>
                      ) : msg.role === 'user' ? (
                        msg.text
                      ) : msg.text && (
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
                      {msg.failure && (
                        <div className={msg.text ? 'mt-3' : undefined}>
                          {msg.text && <p className="text-xs text-white/55">Response interrupted</p>}
                          <p role="alert">{msg.failure}</p>
                          {idx === messages.length - 1 && (
                            <button
                              type="button"
                              className="mt-2 underline underline-offset-4"
                              onClick={() => void handleSend(messages[idx - 1].text, true)}
                            >
                              Retry response
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : null,
              )}
            </div>
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
