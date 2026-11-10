import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { contacts, productLinks } from '../../shared/official';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState<'Products' | 'Contact' | null>(null);
  const [mobile, setMobile] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 20);
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdown(null);
        setMobile(false);
        menuRef.current?.focus();
      }
    };
    const outside = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setDropdown(null);
        setMobile(false);
      }
    };
    window.addEventListener('scroll', scroll, { passive: true });
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', outside);
    return () => {
      window.removeEventListener('scroll', scroll);
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', outside);
    };
  }, []);
  const close = () => {
    setMobile(false);
    setDropdown(null);
  };
  const products = (
    <a
      href={productLinks.home}
      target="_blank"
      rel="noopener noreferrer"
      onClick={close}
      className="lolixco-product flex items-center gap-3 py-3 transition-colors duration-200"
    >
      Lolixco{' '}
      <span className="text-[10px] border border-white/20 rounded-full px-2 py-1 text-white/60">
        LIVE BETA
      </span>
      <ArrowUpRight className="w-4 h-4" />
    </a>
  );
  const contactItems = Object.entries(contacts).map(([kind, email]) => (
    <a
      key={kind}
      href={`mailto:${email}`}
      onClick={close}
      className="flex flex-col gap-1 py-3 text-sm hover:text-white/70"
    >
      <span className="text-[10px] uppercase tracking-widest text-white/40">
        {kind === 'general'
          ? 'Company inquiries'
          : kind === 'support'
            ? 'Lolixco support'
            : 'Copyright & rights'}
      </span>
      {email}
    </a>
  ));
  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-colors duration-300 ${scrolled || dropdown || mobile ? 'bg-black/90 backdrop-blur-xl border-b border-white/[0.06]' : 'bg-transparent'}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <a href="/" aria-label="Golixco home" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/brand/golixco-mark.svg"
            width="52"
            height="56"
            alt=""
            className="w-11 h-12 md:w-[52px] md:h-14 object-contain"
          />
        </a>
        <div className="hidden md:flex items-center gap-8">
          {(['Products', 'Blog', 'Contact', 'Follow'] as const).map((item) =>
            item === 'Blog' || item === 'Follow' ? (
              <a
                key={item}
                href={item === 'Blog' ? '/blog' : '/#stay-in-touch'}
                onClick={close}
                className="text-sm text-white/75 hover:text-white py-3"
              >
                {item}
              </a>
            ) : (
              <button
                key={item}
                aria-expanded={dropdown === item}
                aria-controls="nav-dropdown"
                onClick={() => setDropdown(dropdown === item ? null : item)}
                className="text-sm text-white/75 hover:text-white py-3"
              >
                {item}
              </button>
            ),
          )}
        </div>
        <button
          ref={menuRef}
          aria-label={mobile ? 'Close menu' : 'Open menu'}
          aria-expanded={mobile}
          aria-controls="mobile-menu"
          onClick={() => {
            setMobile(!mobile);
            setDropdown(null);
          }}
          className="md:hidden p-3 -mr-2"
        >
          {mobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      <AnimatePresence>
        {dropdown && (
          <motion.div
            id="nav-dropdown"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="hidden md:block border-t border-white/10 overflow-hidden"
          >
            <div className="max-w-3xl mx-auto flex gap-12 justify-center p-6">
              {dropdown === 'Products' ? products : contactItems}
            </div>
          </motion.div>
        )}
        {mobile && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-6 gap-3 max-h-[calc(100dvh-4rem)] overflow-y-auto">
              {products}
              <a href="/blog" onClick={close} className="py-3">
                Blog
              </a>
              <a href="/#about" onClick={close} className="py-3">
                About Golixco
              </a>
              <a href="/#stay-in-touch" onClick={close} className="py-3">
                Follow Golixco
              </a>
              <div className="border-t border-white/10 mt-3 pt-3">{contactItems}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
