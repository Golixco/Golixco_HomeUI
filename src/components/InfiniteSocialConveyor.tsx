import { useEffect, useRef, useState } from 'react';
import { Mail, Terminal, AtSign, Globe, Hash, Send } from 'lucide-react';
import { RevealContainer, RevealItem } from './ScrollReveal';

const XIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const LinkedInIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
const FacebookIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const DiscordIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1569 2.419 0 1.3332-.946 2.4189-2.1569 2.4189z"/></svg>;
const RedditIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"/></svg>;
const TelegramIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
const ThreadsIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z"/></svg>;
const SlackIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>;
const SubstackIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>;
const DevToIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.56-.02c.41 0 .63-.07.83-.26.24-.24.26-.36.26-2.2 0-1.91-.02-1.96-.29-2.18zM0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-2.53.77H4.71V8.53h1.4c1.67 0 2.16.18 2.6.9.27.43.29.6.32 2.57.05 2.23-.02 2.73-.47 3.3zm5.09-5.47h-2.47v1.77h1.52v1.28l-.72.04-.75.03v1.77l1.22.03 1.2.04v1.28h-1.6c-1.53 0-1.6-.01-1.87-.3l-.3-.28v-3.16c0-3.02.01-3.18.25-3.48.23-.31.25-.31 1.88-.31h1.64v1.3zm4.68 5.45c-.17.43-.64.79-1 .79-.18 0-.45-.15-.67-.39-.32-.32-.45-.63-.82-2.08l-.9-3.39-.45-1.67h.76c.4 0 .75.02.75.05 0 .06 1.16 4.54 1.26 4.83.04.15.32-.7.73-2.3l.66-2.52.74-.04c.4-.02.73 0 .73.04 0 .14-1.67 6.38-1.8 6.68z"/></svg>;
const GithubIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
const BlueskyIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"/></svg>;

const topRow = [
  { name: 'X', icon: <XIcon />, url: 'https://x.com/Golixco' },
  { name: 'Instagram', icon: <InstagramIcon />, url: 'https://www.instagram.com/golixco/' },
  { name: 'LinkedIn', icon: <LinkedInIcon />, url: 'https://www.linkedin.com/company/golixco/' },
  { name: 'Reddit', icon: <RedditIcon />, url: 'https://www.reddit.com/r/Golixco/' },
  { name: 'Telegram', icon: <TelegramIcon />, url: 'https://t.me/GolixcoAI' },
  { name: 'Discord', icon: <DiscordIcon />, url: 'https://discord.gg/RcsYSqh7bK' },
  { name: 'GitHub', icon: <GithubIcon />, url: 'https://github.com/GolixcoAI' },
];

const bottomRow = [
  { name: 'Facebook', icon: <FacebookIcon />, url: 'https://www.facebook.com/people/Golixco/61591436109259/' },
  { name: 'Threads', icon: <ThreadsIcon />, url: 'https://www.threads.com/@golixco' },
  { name: 'Mail', icon: <Mail className="w-full h-full" />, url: 'mailto:hello@golixco.com' },
  { name: 'Slack', icon: <SlackIcon />, url: 'https://join.slack.com/t/golixco/shared_invite/zt-462najl7o-eax0h5DNxvHQ8KK9UxaxXg' },
  { name: 'Substack', icon: <SubstackIcon />, url: 'https://substack.com/@golixco' },
  { name: 'DEV', icon: <DevToIcon />, url: 'https://dev.to/golixco' },
  { name: 'Bluesky', icon: <BlueskyIcon />, url: 'https://bsky.app/profile/golixco.com' },
];

const topSet = [...topRow, ...topRow];
const bottomSet = [...bottomRow, ...bottomRow];

const topFull = [...topSet, ...topSet, ...topSet];
const bottomFull = [...bottomSet, ...bottomSet, ...bottomSet];

export function InfiniteSocialConveyor() {
  const topContainerRef = useRef<HTMLDivElement>(null);
  const bottomContainerRef = useRef<HTMLDivElement>(null);
  const freqContainerRef = useRef<HTMLDivElement>(null);
  
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);
  
  const topItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const bottomItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const setRef = useRef<HTMLDivElement>(null);
  const [setWidth, setSetWidth] = useState(2880);

  useEffect(() => {
    const updateWidth = () => {
      if (setRef.current) {
        setSetWidth(setRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      targetScroll.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    
    currentScroll.current = window.scrollY;
    targetScroll.current = window.scrollY;

    let animationFrameId: number;

    const loop = () => {
      // Fast settle to stop precisely when user stops scrolling
      currentScroll.current += (targetScroll.current - currentScroll.current) * 0.5;
      
      const speed = 3.5;
      const scrollOffset = currentScroll.current * speed;
      
      const W = setWidth;
      
      if (W > 0) {
        // Top row moves right on scroll down
        const topX = scrollOffset;
        const wrappedTopX = ((topX % W) + W) % W;
        if (topContainerRef.current) {
          topContainerRef.current.style.transform = `translate3d(calc(-${W}px + ${wrappedTopX}px), 0, 0)`;
        }

        // Bottom row moves left on scroll down
        const bottomX = -scrollOffset;
        const wrappedBottomX = ((bottomX % W) + W) % W;
        if (bottomContainerRef.current) {
          bottomContainerRef.current.style.transform = `translate3d(calc(-${W}px + ${wrappedBottomX}px), 0, 0)`;
        }
      }

      // Freq lines shift slightly with conveyor
      const freqX = scrollOffset * 0.4;
      const wrappedFreqX = ((freqX % 168) + 168) % 168; 
      if (freqContainerRef.current) {
        freqContainerRef.current.style.transform = `translate3d(${wrappedFreqX}px, 0, 0)`;
      }

      // Perspective scale based on viewport center
      const viewportCenter = window.innerWidth / 2;
      const maxDist = window.innerWidth / 2;

      const updateScale = (refs: (HTMLAnchorElement | null)[]) => {
        refs.forEach(item => {
          if (!item) return;
          const rect = item.getBoundingClientRect();
          const itemCenter = rect.left + rect.width / 2;
          
          if (rect.right < 0 || rect.left > window.innerWidth) return;

          const dist = Math.abs(viewportCenter - itemCenter);
          const normalizedDist = Math.min(dist / maxDist, 1);
          // Scale from 1 to 0.92
          const scale = 1 - (normalizedDist * 0.08); 
          
          const inner = item.firstElementChild as HTMLElement;
          if (inner) {
            inner.style.transform = `scale(${scale})`;
          }
        });
      };

      updateScale(topItemsRef.current);
      updateScale(bottomItemsRef.current);

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [setWidth]);

  return (
    <section id="stay-in-touch" className="py-16 md:py-24 flex flex-col items-center overflow-hidden">
      <RevealContainer className="w-full max-w-[1440px] mx-auto px-8 mb-16 relative z-10">
        <RevealItem className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">Stay in touch with us</h2>
          <p className="text-white/70 max-w-xl mx-auto text-lg leading-relaxed">
            Follow our journey across these platforms.
          </p>
        </RevealItem>
      </RevealContainer>

      <div className="w-full relative">
        {/* Subtle grid background texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.15]" 
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} 
        />

        {/* Hidden element to measure the exact pixel width of one complete set */}
        <div className="absolute opacity-0 pointer-events-none invisible -z-10">
          <div ref={setRef} className="flex">
            {topSet.map((_, i) => (
              <div key={i} className="w-[90px] md:w-[240px] shrink-0" />
            ))}
          </div>
        </div>

        {/* Conveyor container with edge fade masks */}
        <div 
          className="relative w-full group/conveyor bg-black/40 border-t border-b border-[rgba(255,255,255,0.08)] backdrop-blur-sm"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.25) 8%, white 18%, white 82%, rgba(255,255,255,0.25) 92%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.25) 8%, white 18%, white 82%, rgba(255,255,255,0.25) 92%, transparent 100%)'
          }}
        >
          
          {/* Top Row */}
          <div>
            <div ref={topContainerRef} className="flex w-max will-change-transform">
              {topFull.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  ref={el => { topItemsRef.current[i] = el; }}
                  className="w-[90px] h-[90px] md:w-[240px] md:h-[240px] border-r border-[rgba(255,255,255,0.08)] flex items-center justify-center shrink-0 border-l-[rgba(255,255,255,0.08)] first:border-l"
                >
                  <div className="flex flex-col items-center justify-center gap-2 md:gap-3 w-full h-full opacity-100 group-hover/conveyor:opacity-35 hover:!opacity-100 transition-opacity duration-300 will-change-transform">
                    <div className="text-white/90 group-hover/conveyor:hover:text-white transition-colors duration-300 w-5 h-5 md:w-8 md:h-8">
                      {item.icon}
                    </div>
                    <span className="text-white/55 group-hover/conveyor:hover:text-white font-medium text-[10px] md:text-sm transition-colors duration-300">
                      {item.name}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Frequency Divider */}
          <div className="h-6 md:h-8 border-t border-b border-[rgba(255,255,255,0.08)] relative flex items-center justify-center">
            
            {/* Static Background Pattern (Small Ticks) */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(to right, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 24px)`,
                backgroundSize: '24px 30%',
                backgroundPosition: 'left center',
                backgroundRepeat: 'repeat-x'
              }}
            />

            {/* Moving Center Frequency Scanner */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)'
              }}
            >
              <div 
                ref={freqContainerRef}
                className="absolute top-0 bottom-0 left-[-100vw] w-[300vw] will-change-transform"
                style={{
                  backgroundImage: `repeating-linear-gradient(to right, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 1px, transparent 1px, transparent 168px)`,
                  backgroundSize: '168px 55%',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'repeat-x'
                }}
              />
            </div>
          </div>

          {/* Bottom Row */}
          <div>
            <div ref={bottomContainerRef} className="flex w-max will-change-transform">
              {bottomFull.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  ref={el => { bottomItemsRef.current[i] = el; }}
                  className="w-[90px] h-[90px] md:w-[240px] md:h-[240px] border-r border-[rgba(255,255,255,0.08)] flex items-center justify-center shrink-0 border-l-[rgba(255,255,255,0.08)] first:border-l"
                >
                  <div className="flex flex-col items-center justify-center gap-2 md:gap-3 w-full h-full opacity-100 group-hover/conveyor:opacity-35 hover:!opacity-100 transition-opacity duration-300 will-change-transform">
                    <div className="text-white/90 group-hover/conveyor:hover:text-white transition-colors duration-300 w-5 h-5 md:w-8 md:h-8">
                      {item.icon}
                    </div>
                    <span className="text-white/55 group-hover/conveyor:hover:text-white font-medium text-[10px] md:text-sm transition-colors duration-300">
                      {item.name}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

