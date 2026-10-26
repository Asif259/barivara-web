'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthHydrated, useAuthStore } from '@/stores/auth-store';
import { useLandingCopy } from './use-landing-copy';
import LandingNav from './LandingNav';
import Hero from './Hero';
import StorySection from './StorySection';
import FeatureGrid from './FeatureGrid';
import Showcase from './Showcase';
import Comparison from './Comparison';
import Trust from './Trust';
import Roadmap from './Roadmap';
import HowItWorks from './HowItWorks';
import FaqSection from './FaqSection';
import FinalCta from './FinalCta';
import LandingFooter from './LandingFooter';

export default function LandingPage() {
  const { lang, t } = useLandingCopy();
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    const previous = document.documentElement.lang;
    const previousTitle = document.title;
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    return () => {
      document.documentElement.lang = previous;
      document.title = previousTitle;
    };
  }, [lang, t.meta.title]);

  return (
    <div className="landing-root min-h-screen overflow-x-clip">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#7ff0c2] focus:px-4 focus:py-2 focus:text-[13px] focus:font-medium focus:text-[#05100c]"
      >
        {t.common.skipToContent}
      </a>
      <LandingNav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <StorySection />
        <FeatureGrid />
        <Showcase />
        <Comparison />
        <HowItWorks />
        <Trust />
        <Roadmap />
        <FaqSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
