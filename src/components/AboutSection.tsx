import { RevealContainer, RevealItem } from './ScrollReveal';
import { motion } from 'motion/react';

export function AboutSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-4 md:px-8 max-w-[1440px] mx-auto flex items-center">
      <div className="w-full max-w-2xl z-10">
        <RevealContainer>
          <RevealItem className="mb-12 md:mb-16">
            <h3 className="text-white/40 text-xs font-semibold tracking-[0.2em] uppercase mb-4">About Us</h3>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">Meet Golixco</h2>
            <div className="w-12 h-[2px] bg-white/20" />
          </RevealItem>

          <div className="space-y-12 md:space-y-16">
            <RevealItem>
              <h4 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">Our Mission</h4>
              <p className="text-white/70 leading-relaxed text-base md:text-lg max-w-lg">
                We build intelligent products that empower creators, developers and dreamers to achieve more with technology. Simplicity, innovation and impact drive everything we do.
              </p>
            </RevealItem>

            <RevealItem>
              <h4 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">Our Story</h4>
              <p className="text-white/70 leading-relaxed text-base md:text-lg max-w-lg">
                Golixco began as a solo vision fueled by curiosity and a passion for AI. From late nights of code to building tools that solve real problems — this journey is just getting started.
              </p>
            </RevealItem>

            <RevealItem>
              <h4 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">Our Vision</h4>
              <p className="text-white/70 leading-relaxed text-base md:text-lg max-w-lg">
                To be a global AI lab that creates products people love and rely on — while inspiring the next generation of builders.
              </p>
            </RevealItem>
          </div>
        </RevealContainer>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-full md:w-[50%] flex flex-col justify-center overflow-hidden opacity-[0.05] md:opacity-[0.15] pointer-events-none select-none mask-gradient">
        <motion.div 
          animate={{ y: ["-5%", "5%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear", repeatType: "mirror" }}
          className="text-4xl md:text-[4rem] leading-none font-pixel text-right md:text-right break-all w-[150%] md:-mr-[10%] text-white"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {Array(20).fill("01000111 01101111 01101100 01101001 01111000 01100011 01101111 ").join("")}
        </motion.div>
      </div>
    </section>
  );
}
