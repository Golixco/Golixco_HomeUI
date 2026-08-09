import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Target, Zap, Rocket, Loader2 } from 'lucide-react';
import { RevealContainer, RevealItem } from './ScrollReveal';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const LANGUAGES = [
  "Golixco", // English
  "Голикско", // Russian
  "Γκόλιξκο", // Greek
  "Golixco", // English
  "غوليكسكو", // Arabic
  "גוליקסקו", // Hebrew
  "Golixco", // English
  "गोलिक्सको", // Hindi
  "ગોલિક્સકો", // Gujarati
  "Golixco", // English
  "戈利克斯科", // Chinese
  "ゴリクスコ", // Japanese
  "Golixco", // English
  "โกลิกซ์โก", // Thai
  "கோலிக்ஸ்கோ", // Tamil
  "Golixco", // English
  "গলিক্সকো", // Bengali
  "ਗੋਲਿਕਸਕੋ", // Punjabi
  "Golixco", // English
  "გოლიქსკო", // Georgian
  "Գոլիքսկո", // Armenian
  "Golixco", // English
  "Голікско", // Ukrainian
  "گولیکسکو"  // Persian
];

const QUICK_QUESTIONS: Record<string, string> = {
  "What is Golixco?": "What is Golixco?",
  "Our Mission": "What is the mission of Golixco?",
  "Latest Updates": "What are the latest updates from Golixco?",
  "Future Plans": "What are the future plans for Golixco?"
};

export function HeroSection() {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isLoading) return;

    const userMessage = text.trim();
    setInputValue('');
    setShouldAnimate(false);

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isFocused || inputValue.length > 0) {
      setShouldAnimate(false);
    } else {
      timeoutId = setTimeout(() => {
        setShouldAnimate(true);
        setCurrentIndex(0);
      }, 2000);
    }

    return () => clearTimeout(timeoutId);
  }, [isFocused, inputValue]);

  useEffect(() => {
    if (!shouldAnimate) return;

    const isEnglish = LANGUAGES[currentIndex] === "Golixco";
    const duration = isEnglish ? 5000 : 2000;

    const timeoutId = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % LANGUAGES.length);
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [currentIndex, shouldAnimate]);

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center pt-32 pb-16 px-4 relative z-10">
      <RevealContainer className="w-full max-w-3xl flex flex-col items-center">
        <RevealItem>
          <h1 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight text-center text-white">
            What would you like to know about
          </h1>
        </RevealItem>

        <RevealItem className="w-full max-w-2xl mb-8">
          <div className="relative group flex items-center bg-[#0E0E0E] rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-colors duration-300 overflow-hidden">
            <AnimatePresence>
              {shouldAnimate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <AnimatePresence>
                    <motion.div
                      key={currentIndex}
                      initial={{ y: 22, opacity: 0, filter: 'blur(2px)' }}
                      animate={{ y: 0, opacity: 0.35, filter: 'blur(0px)' }}
                      exit={{ y: -22, opacity: 0, filter: 'blur(2px)' }}
                      transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
                      className="absolute inset-0 flex items-center justify-start pl-6"
                    >
                      <span className="font-medium tracking-[0.22em] text-white">
                        {LANGUAGES[currentIndex]}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-white px-6 py-5 outline-none rounded-2xl text-lg relative z-10 text-left"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-3 p-3 bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors z-20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <ArrowRight className="w-5 h-5 text-white" />}
            </button>
          </div>
        </RevealItem>

        {messages.length === 0 ? (
          <RevealItem className="w-full flex flex-wrap justify-center gap-3">
            {[
              { text: "What is Golixco?", icon: <Sparkles className="w-4 h-4" /> },
              { text: "Our Mission", icon: <Target className="w-4 h-4" /> },
              { text: "Latest Updates", icon: <Zap className="w-4 h-4" /> },
              { text: "Future Plans", icon: <Rocket className="w-4 h-4" /> }
            ].map((pill, i) => (
              <button
                key={i}
                onClick={() => {
                  const mappedQuestion = QUICK_QUESTIONS[pill.text] || pill.text;
                  setInputValue(mappedQuestion);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/[0.06] bg-[#090909] hover:border-white/[0.12] transition-colors duration-300 text-sm font-medium text-white/70 hover:text-white"
              >
                {pill.icon}
                {pill.text}
              </button>
            ))}
          </RevealItem>
        ) : (
          <RevealItem className="w-full max-w-2xl mt-4">
            <div
              ref={chatContainerRef}
              className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                        ? 'bg-white/10 text-white rounded-br-sm'
                        : 'bg-[#090909] border border-white/[0.06] text-white/90 rounded-bl-sm'
                      }`}
                  >
                    {msg.role === 'user' ? (
                      msg.text.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i !== msg.text.split('\n').length - 1 && <br />}
                        </span>
                      ))
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                          em: ({ node, ...props }) => <em className="italic" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 last:mb-0 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 last:mb-0 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li {...props} />,
                          a: ({ node, ...props }) => <a className="underline hover:text-white/80 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                          code: ({ node, inline, ...props }: any) =>
                            inline
                              ? <code className="bg-white/10 px-1.5 py-0.5 rounded-md text-xs font-mono" {...props} />
                              : <pre className="bg-black/50 p-3 rounded-lg overflow-x-auto text-xs font-mono mb-4 last:mb-0"><code {...props} /></pre>,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </RevealItem>
        )}
      </RevealContainer>
    </section>
  );
}
