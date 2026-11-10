import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

// Phonetic brand renderings; the official Latin-script name remains Golixco.
export const brandNames = [
  { lang: 'ja', text: 'ゴリクスコ' },
  { lang: 'zh-Hans', text: '戈利克斯科' },
  { lang: 'en', text: 'Golixco' },
  { lang: 'ko', text: '골릭스코' },
  { lang: 'ar', text: 'غوليكسكو', dir: 'rtl' },
  { lang: 'en', text: 'Golixco' },
  { lang: 'hi', text: 'गोलिक्सको' },
  { lang: 'el', text: 'Γκόλιξκο' },
  { lang: 'en', text: 'Golixco' },
  { lang: 'ru', text: 'Голикско' },
] as const;
export function BrandName({ paused }: { paused: boolean }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (paused || reduced) return;
    const timer = setTimeout(
      () => setIndex((i) => (i + 1) % brandNames.length),
      brandNames[index].lang === 'en' ? 3000 : 2000,
    );
    return () => clearTimeout(timer);
  }, [index, paused, reduced]);
  const item = reduced ? { lang: 'en', text: 'Golixco' } : brandNames[index];
  if (paused) return null;
  return (
    <div
      aria-hidden="true"
      data-testid="brand-name"
      data-language={item.lang}
      className="absolute inset-y-0 left-5 flex items-center pointer-events-none"
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.span
          key={item.lang + index}
          lang={item.lang}
          dir={'dir' in item ? item.dir : 'ltr'}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.25 }}
          className="absolute whitespace-nowrap tracking-[0.16em]"
        >
          {item.text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
