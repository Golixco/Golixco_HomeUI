import React, { useState } from 'react';
import { ArrowRight, Smile, Lock } from 'lucide-react';
import { RevealContainer, RevealItem } from './ScrollReveal';
import { motion, AnimatePresence } from 'motion/react';

export function NewsletterSection() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-16 md:py-24 px-8 max-w-[1440px] mx-auto">
      <RevealContainer>
        <RevealItem className="bg-[#090909] border border-white/[0.06] rounded-[2rem] p-12 md:p-20 relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-12 items-center justify-between">
            
            <div className="flex-1">
              <h3 className="text-white/40 text-xs font-semibold tracking-[0.2em] uppercase mb-4">Newsletter</h3>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white">Subscribe to our monthly newsletter.</h2>
              <p className="text-white/70 max-w-md text-lg leading-relaxed">Get the latest updates, builds, insights and stories delivered straight to your inbox. No spam, ever.</p>
            </div>

            <div className="w-full md:w-auto min-w-[320px]">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <input 
                      type="email" 
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 bg-[#0E0E0E] border border-white/[0.06] rounded-xl px-6 py-4 text-white placeholder:text-white/40 outline-none focus:border-white/20 transition-colors"
                    />
                    <button type="submit" className="bg-white text-black font-medium px-8 py-4 rounded-xl hover:bg-[#EDEDED] transition-colors flex items-center justify-center gap-2">
                      Subscribe <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                    className="flex flex-col items-center justify-center text-center p-8 bg-[#0E0E0E] rounded-xl border border-white/[0.06] h-[72px]"
                  >
                    <p className="font-medium text-white flex items-center gap-2">
                      <Smile className="w-5 h-5 text-white" /> Thank you! You're officially part of Golixco.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </RevealItem>
        <RevealItem className="text-center mt-8 text-white/40 text-sm flex items-center justify-center gap-2">
          <Lock className="w-3 h-3" />
          We respect your privacy. Unsubscribe anytime.
        </RevealItem>
      </RevealContainer>
    </section>
  );
}
