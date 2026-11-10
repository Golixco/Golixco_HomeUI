import { RevealContainer, RevealItem } from './ScrollReveal';
import { contacts, socials } from '../../shared/official';
export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10 px-4 md:px-8 bg-black pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <RevealContainer viewportMargin="0px" className="max-w-[1440px] mx-auto flex flex-col gap-8">
        <RevealItem className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <a href="/" aria-label="Golixco home" className="flex items-center gap-2.5">
            <img
              src="/brand/golixco-mark.svg"
              alt=""
              width="28"
              height="32"
              className="w-9 h-10 opacity-50 hover:opacity-80 transition-opacity"
            />
          </a>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <a href="/blog" className="text-xs text-white/55 hover:text-white py-2">
              Blog
            </a>
            <a href="/rss.xml" className="text-xs text-white/55 hover:text-white py-2">
              RSS
            </a>
            {socials
              .filter((s) =>
                ['X', 'LinkedIn', 'Instagram', 'Discord', 'GitHub', 'Reddit'].includes(s.name),
              )
              .map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/55 hover:text-white py-2"
                >
                  {s.name}
                </a>
              ))}
          </div>
        </RevealItem>
        <RevealItem className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/45">
          <p>© {new Date().getFullYear()} Golixco. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {Object.entries(contacts).map(([kind, email]) => (
              <a key={kind} href={`mailto:${email}`} className="hover:text-white py-2">
                {email}
              </a>
            ))}
          </div>
        </RevealItem>
      </RevealContainer>
    </footer>
  );
}
