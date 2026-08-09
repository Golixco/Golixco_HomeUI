import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RevealContainer, RevealItem } from './ScrollReveal';
import { motion, AnimatePresence } from 'motion/react';

const timelineData = [
  { year: '2020', title: 'The name "Golixco" was found', subtitle: '' },
  { year: '2021', title: 'Exploring the Possibilities', subtitle: '(Figuring Things Out)' },
  { year: '2023', title: 'Shaping the Vision', subtitle: '(Still Figuring Things Out)' },
  { year: '2024', title: 'Turning Ideas Into Direction', subtitle: '(“What If?” Into “Let’s Do It”)' },
  { year: '2026', title: 'Golixco.com — Official Launch', subtitle: '' }
];

export function HistoryTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => setActiveIndex((prev) => Math.min(prev + 1, timelineData.length - 1));
  const handlePrev = () => setActiveIndex((prev) => Math.max(prev - 1, 0));

  return (
    <section className="py-16 md:py-24 px-8 max-w-[1440px] mx-auto flex flex-col items-center">
      <RevealContainer className="w-full flex flex-col items-center">
        <RevealItem className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">Our history</h2>
          <p className="text-white/70 max-w-xl mx-auto text-lg leading-relaxed">
            Take a look at where we started and how far we've come.
          </p>
        </RevealItem>

        <RevealItem className="w-full max-w-4xl bg-[#090909] border border-white/[0.06] rounded-[2rem] p-4 sm:p-6 md:p-16">
          <div className="relative flex items-center mb-10 md:mb-16 bg-[#0E0E0E] rounded-full p-1.5 md:p-2 border border-white/[0.06] overflow-hidden">
            {timelineData.map((item, index) => (
              <button
                key={item.year}
                onClick={() => setActiveIndex(index)}
                className={`relative z-10 flex-1 py-2.5 md:py-3 text-center text-[11px] sm:text-xs md:text-sm font-medium transition-colors duration-300 ${
                  activeIndex === index ? 'text-black' : 'text-white/70 hover:text-white'
                }`}
              >
                {activeIndex === index && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-white rounded-full -z-10"
                    transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                  />
                )}
                {item.year}
              </button>
            ))}
          </div>

          <div className="min-h-[6rem] md:min-h-[8rem] flex items-center justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                className="flex flex-col items-center gap-2"
              >
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-white">
                  {timelineData[activeIndex].title}
                </h3>
                {timelineData[activeIndex].subtitle && (
                  <span className="text-sm md:text-base text-white/50 font-medium text-center">
                    {timelineData[activeIndex].subtitle}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-4 mt-12">
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="p-3 rounded-full border border-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:border-white/20"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex === timelineData.length - 1}
              className="p-3 rounded-full border border-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:border-white/20"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </RevealItem>
      </RevealContainer>
    </section>
  );
}
