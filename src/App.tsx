import { MotionConfig } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { HistoryTimeline } from './components/HistoryTimeline';
import { InfiniteSocialConveyor } from './components/InfiniteSocialConveyor';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { NotFound } from './components/NotFound';

export default function App() {
  // Simple SPA routing to handle 404s
  if (window.location.pathname !== '/') {
    return <NotFound />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-black text-white min-h-screen selection:bg-white/20 overflow-x-clip flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navbar />

        <main id="main-content" className="flex-1 overflow-x-clip">
          <HeroSection />
          <AboutSection />
          <HistoryTimeline />
          <InfiniteSocialConveyor />
          <NewsletterSection />
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
