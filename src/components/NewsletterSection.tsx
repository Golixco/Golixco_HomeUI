import { ArrowRight, Clock3 } from 'lucide-react';
import { RevealContainer, RevealItem } from './ScrollReveal';

export function NewsletterSection() {
  return (
    <section
      aria-labelledby="newsletter-heading"
      className="py-16 md:py-24 px-4 md:px-8 max-w-[1440px] mx-auto"
    >
      <RevealContainer>
        <RevealItem className="bg-[#090909] border border-white/[0.06] rounded-[2rem] p-6 sm:p-10 md:p-16 relative overflow-hidden">
          <div className="flex flex-col xl:flex-row gap-10 items-start xl:items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-white/40 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                Newsletter
              </h3>
              <h2
                id="newsletter-heading"
                className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
              >
                Stay close to what comes next.
              </h2>
              <p className="text-white/60 max-w-md text-base md:text-lg leading-relaxed">
                Builds, ideas and stories from Golixco. Our newsletter is coming soon.
              </p>
            </div>
            <div className="w-full xl:max-w-md min-w-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="newsletter-email" className="sr-only">
                  Newsletter email signup — coming soon
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  disabled
                  placeholder="Email signup coming soon"
                  className="w-full min-w-0 bg-[#0E0E0E] border border-white/[0.06] rounded-xl px-4 py-4 text-white/40 cursor-not-allowed"
                />
                <button
                  disabled
                  type="button"
                  className="shrink-0 bg-white/10 text-white/45 font-medium px-5 py-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  Coming soon <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-white/45 mt-3 flex items-start gap-2">
                <Clock3 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Signup is unavailable for now. No email is collected or saved here.
              </p>
            </div>
          </div>
        </RevealItem>
      </RevealContainer>
    </section>
  );
}
