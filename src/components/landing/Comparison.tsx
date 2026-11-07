'use client';

import { ArrowRight, Check } from './icons';
import { Reveal, SectionHead } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function Comparison() {
  const { t } = useLandingCopy();

  return (
    <section id="comparison" className="relative scroll-mt-20 bg-[#0d1f18] py-24 text-[#e9f3ee] sm:py-32">
      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHead eyebrow={t.comparison.eyebrow} title={t.comparison.title} lead={t.comparison.lead} tone="dark" />
        </Reveal>

        <Reveal delay={80} className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="hidden grid-cols-[0.8fr_1fr_1fr] gap-4 border-b border-white/10 px-6 py-4 text-xs font-semibold text-[#9db3a8] md:grid">
              <span aria-hidden="true" />
              <span className="text-[#8ba196]">{t.comparison.paperLabel}</span>
              <span className="text-[#8fe9c4]">{t.comparison.bariLabel}</span>
            </div>

            <ul className="divide-y divide-white/[0.06]">
              {t.comparison.rows.map((row, index) => (
                <Reveal
                  as="li"
                  key={row.label}
                  delay={Math.min(index * 60, 240)}
                  className="grid gap-2 px-6 py-5 md:grid-cols-[0.8fr_1fr_1fr] md:items-center md:gap-4"
                >
                  <p className="text-xs text-[#8ba196] md:text-sm md:font-medium md:text-[#e9f3ee]">
                    {row.label}
                  </p>
                  <p className="flex items-start gap-2 text-sm leading-relaxed text-[#6d8478] line-through decoration-[#43584e] decoration-1">
                    {row.paper}
                  </p>
                  <p className="flex items-start gap-2 text-sm leading-relaxed text-[#d9e8e0]">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#8fe9c4]/15 text-[#8fe9c4]">
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
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#8fe9c4] transition-colors hover:text-[#b4f3d7]"
          >
            {t.showcase.eyebrow}
            <ArrowRight className="h-3.5 w-3.5 motion-safe:transition-transform group-hover:translate-x-0.5" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
