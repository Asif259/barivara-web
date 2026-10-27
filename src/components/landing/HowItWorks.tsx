'use client';

import Link from 'next/link';
import { Reveal, SectionHead } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function HowItWorks() {
  const { t } = useLandingCopy();

  return (
    <section id="how-it-works" className="relative scroll-mt-20 border-t border-[#0d1f18]/8 bg-[#efeade] py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHead eyebrow={t.howItWorks.eyebrow} title={t.howItWorks.title} lead={t.howItWorks.lead} />
        </Reveal>

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {t.howItWorks.steps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 80} className="relative">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#12664F]/25 bg-[#12664F]/[0.06] text-[11px] font-semibold tabular-nums text-[#12664F]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-[#0d1f18]/12" />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-[#0d1f18]">{step.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#384940]">{step.body}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={200} className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/register"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#12664F] px-6 text-sm font-medium text-white transition-colors hover:bg-[#0e513f]"
          >
            {t.common.getStarted}
            <span aria-hidden="true">→</span>
          </Link>
          <p className="text-[12px] text-[#384940]">{t.howItWorks.ctaNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
