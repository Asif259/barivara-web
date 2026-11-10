'use client';

import { ArrowRight, Check } from './icons';
import { Reveal, SectionHead } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function Comparison() {
  const { t } = useLandingCopy();

  return (
    <section id="comparison" className="bv-paper relative scroll-mt-20 border-t border-[#0d1f18]/10 py-24 sm:py-32">
      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHead eyebrow={t.comparison.eyebrow} title={t.comparison.title} lead={t.comparison.lead} tone="light" />
        </Reveal>

        <Reveal delay={80} className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-[#0d1f18]/10 bg-white shadow-sm">
            <div className="hidden grid-cols-[0.85fr_1fr_1fr] gap-4 border-b border-[#0d1f18]/10 bg-[#f7f5ee] px-6 py-4 text-xs font-semibold md:grid">
              <span className="text-[#5c6f65]">{t.comparison.eyebrow}</span>
              <span className="text-[#8c786a]">{t.comparison.paperLabel}</span>
              <span className="text-[#12664F]">{t.comparison.bariLabel}</span>
            </div>

            <ul className="divide-y divide-[#0d1f18]/[0.06]">
              {t.comparison.rows.map((row, index) => (
                <Reveal
                  as="li"
                  key={row.label}
                  delay={Math.min(index * 60, 240)}
                  className="grid gap-2 px-6 py-5 md:grid-cols-[0.85fr_1fr_1fr] md:items-center md:gap-4 transition-colors hover:bg-[#faf8f2]"
                >
                  <p className="text-xs font-medium text-[#0d1f18] md:text-sm">
                    {row.label}
                  </p>
                  <p className="flex items-start gap-2 text-sm leading-relaxed text-[#8c786a] line-through decoration-[#b8a89c] decoration-1">
                    {row.paper}
                  </p>
                  <p className="flex items-start gap-2 text-sm font-medium leading-relaxed text-[#0d1f18]">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#12664F]/10 text-[#12664F]">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <span>{row.bari}</span>
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={120} className="mt-8">
          <a
            href="#showcase"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#12664F] transition-colors hover:text-[#0a3f31]"
          >
            {t.showcase.eyebrow}
            <ArrowRight className="h-3.5 w-3.5 motion-safe:transition-transform group-hover:translate-x-0.5" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
