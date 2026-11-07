'use client';

import { useEffect, useRef, useState } from 'react';
import { useLandingCopy } from './use-landing-copy';
import { cn } from '@/lib/utils';

export default function TaglineReveal() {
  const { lang, t } = useLandingCopy();
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const text =
    lang === 'bn'
      ? 'কাগজের খাতার ঝামেলা আর হিসাবের ভুল পেছনে ফেলে, আপনার প্রতিটি বাড়ি আর প্রতিটি টাকার সঠিক হিসাব রাখুন এক আঙুলের ডগায়।'
      : 'Leave paper ledger chaos and arithmetic mistakes behind, keeping every unit and every taka strictly accounted for in your hands.';

  const words = text.split(' ');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const node = sectionRef.current;
    if (!node) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = node.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // Start activating when top enters 80% from top, complete at 30%
        const start = windowHeight * 0.8;
        const end = windowHeight * 0.3;
        const p = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
        setProgress(p);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative scroll-mt-20 border-y border-white/[0.08] bg-[#071712] py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-[680px] text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[#8fe9c4]">
            {lang === 'bn' ? 'মূল প্রতিশ্রুতি' : 'Our core commitment'}
          </p>
          <h2 className="mt-6 text-balance text-2xl font-semibold leading-relaxed tracking-normal text-[#f2faf6] sm:text-3xl lg:text-4xl">
            {words.map((word, index) => {
              const wordThreshold = (index + 0.5) / words.length;
              const isActive = reducedMotion || progress >= wordThreshold;
              return (
                <span
                  key={`${word}-${index}`}
                  className={cn(
                    'inline-block transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] mr-[0.25em] last:mr-0',
                    isActive ? 'text-[#f2faf6]' : 'text-[#f2faf6]/30',
                  )}
                >
                  {word}
                </span>
              );
            })}
          </h2>
          <p className="mt-6 text-pretty text-sm text-[#9db3a8] sm:text-base">
            {lang === 'bn'
              ? 'বাড়িওয়ালাদের নিজস্ব খতিয়ান, নিরাপদ তথ্য ও শতভাগ নির্ভুল ভাড়ার হিসাব।'
              : 'Built specifically for Bangladeshi landlords with exact taka arithmetic and reliable records.'}
          </p>
        </div>
      </div>
    </section>
  );
}

