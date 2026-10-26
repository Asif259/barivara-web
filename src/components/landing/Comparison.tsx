'use client';

import { ArrowRight, Check } from './icons';
import { Reveal, SectionHead } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function Comparison() {
  const { t } = useLandingCopy();

  return (
    <section id="comparison" className="relative scroll-mt-20 overflow-hidden bg-[#0d1f18] py-24 text-[#e9f3ee] sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_0%,rgba(45,194,189,0.16),transparent_70%)]"
      />
      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHead eyebrow={t.comparison.eyebrow} title={t.comparison.title} lead={t.comparison.lead} tone="dark" />
        </Reveal>

        <Reveal delay={80} className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="hidden grid-cols-[0.8fr_1fr_1fr] gap-4 border-b border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.22em] md:grid">
              <span className="text-[#829c90]">—</span>
              <span className="text-[#7f978c]">{t.comparison.paperLabel}</span>
              <span className="flex items-center gap-1.5 text-[#7ff0c2]">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#7ff0c2]" />
                {t.comparison.bariLabel}
              </span>
            </div>

            <ul className="divide-y divide-white/[0.07]">
              {t.comparison.rows.map((row, index) => (
                <Reveal
                  as="li"
                  key={row.label}
                  delay={Math.min(index * 60, 240)}
                  className="grid gap-2 px-5 py-4 md:grid-cols-[0.8fr_1fr_1fr] md:items-center md:gap-4"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#7f978c] md:text-[12px] md:normal-case md:tracking-normal md:text-[#e9f3ee]">
                    {row.label}
                  </p>
                  <p className="flex items-start gap-2 text-[13px] leading-snug text-[#6d8478] line-through decoration-[#43584e] decoration-1">
                    {row.paper}
                  </p>
                  <p className="flex items-start gap-2 text-[13px] leading-snug text-[#d9e8e0]">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#7ff0c2]/15 text-[#7ff0c2]">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {row.bari}
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={120} className="mt-8">
          <a
            href="#showcase"
            className="group inline-flex items-center gap-2 text-[13px] text-[#7ff0c2] transition-colors hover:text-[#a9e8cd]"
          >
            {t.showcase.eyebrow}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
