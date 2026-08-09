import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';


export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'Products' | 'Contact' | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    const section = document.getElementById('stay-in-touch');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavHover = (item: string | null) => {
    setHoveredNav(item);
  };

  const navItems = ['Products', 'Blog', 'Contact', 'Follow'];

  return (
    <>
      <nav
        onMouseLeave={() => {
          setHoveredNav(null);
          setActiveDropdown(null);
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-[env(safe-area-inset-top)] ${
          scrolled || activeDropdown || isMobileMenuOpen ? 'bg-black/80 backdrop-blur-[16px]' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex-shrink-0 h-12 flex items-center cursor-pointer focus:outline-none"
          >
             <img src="/logo.svg" alt="Company Logo" className="h-full w-auto object-contain" />
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isHovered = hoveredNav === item;
              const isDimmed = hoveredNav !== null && hoveredNav !== item;
              
              const handleClick = (e: React.MouseEvent) => {
                if (item === 'Products' || item === 'Contact') {
                  e.preventDefault();
                  setActiveDropdown(activeDropdown === item ? null : item);
                } else if (item === 'Follow') {
                  handleFollowClick(e);
                }
              };

              return (
                <a
                  key={item}
                  href={item === 'Blog' ? 'https://blogs.rohansonubablani.com' : '#'}
                  target={item === 'Blog' ? '_blank' : undefined}
                  rel={item === 'Blog' ? 'noopener noreferrer' : undefined}
                  onClick={handleClick}
                  onMouseEnter={() => {
                    handleNavHover(item);
                    if (item === 'Products' || item === 'Contact') {
                      setActiveDropdown(item);
                    } else {
                      setActiveDropdown(null);
                    }
                  }}
                  className="text-white text-sm font-medium py-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                  style={{
                    opacity: isDimmed ? 0.35 : 1
                  }}
                >
                  {item}
                </a>
              );
            })}
          </div>
          
          <div className="hidden md:block w-8" />

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 relative z-50 focus:outline-none"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setActiveDropdown(null);
            }}
          >
            <span 
              className={`absolute w-5 h-[1.5px] bg-white transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'
              }`} 
            />
            <span 
              className={`absolute w-5 h-[1.5px] bg-white transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`} 
            />
            <span 
              className={`absolute w-5 h-[1.5px] bg-white transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'
              }`} 
            />
          </button>
        </div>
        
        {/* Desktop Dropdown */}
        <AnimatePresence>
          {activeDropdown && !isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
              className="hidden md:block w-full border-t border-white/[0.06] bg-black/80 backdrop-blur-[20px] overflow-hidden"
            >
              <div className="max-w-[1440px] mx-auto px-8 py-8 flex justify-center">
                {activeDropdown === 'Products' && (
                  <a href="#" className="flex items-center gap-2 text-white text-lg font-medium hover:text-white/70 transition-colors">
                    Lolixco <ArrowUpRight className="w-5 h-5" />
                  </a>
                )}
                {activeDropdown === 'Contact' && (
                  <a href="mailto:hello@golixco.com" className="text-white text-lg font-medium hover:text-white/70 transition-colors">
                    hello@golixco.com
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Full Screen Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '100vh' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-[20px] border-t border-white/[0.06] flex flex-col px-6 py-8 overflow-y-auto"
              style={{ height: 'calc(100vh - 4rem)' }}
            >
              <div className="flex flex-col gap-6 mt-4">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 0.61, 0.36, 1] }}
                    className="flex flex-col"
                  >
                    {item === 'Products' ? (
                      <div className="flex flex-col gap-4">
                        <span className="text-white/50 text-sm tracking-wider uppercase font-medium">Products</span>
                        <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-white text-2xl font-medium flex items-center gap-2">
                          Lolixco <ArrowUpRight className="w-6 h-6 text-white/50" />
                        </a>
                      </div>
                    ) : item === 'Contact' ? (
                      <div className="flex flex-col gap-4 mt-4">
                        <span className="text-white/50 text-sm tracking-wider uppercase font-medium">Contact</span>
                        <a href="mailto:hello@golixco.com" onClick={() => setIsMobileMenuOpen(false)} className="text-white text-2xl font-medium">
                          hello@golixco.com
                        </a>
                      </div>
                    ) : item === 'Blog' ? (
                      <div className="flex flex-col gap-4 mt-4">
                        <a href="https://blogs.rohansonubablani.com" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="text-white text-2xl font-medium">
                          Blog
                        </a>
                      </div>
                    ) : item === 'Follow' ? (
                      <div className="flex flex-col gap-4 mt-4">
                         <a href="#" onClick={handleFollowClick} className="text-white text-2xl font-medium">
                          Follow
                        </a>
                      </div>
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
