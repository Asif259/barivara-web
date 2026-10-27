'use client';

import { Sparkles } from './icons';
import { Reveal, SectionHead } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function Roadmap() {
  const { t } = useLandingCopy();

  return (
    <section id="roadmap" className="bv-paper relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHead eyebrow={t.roadmap.eyebrow} title={t.roadmap.title} lead={t.roadmap.lead} />
        </Reveal>

        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {t.roadmap.items.map((item, index) => (
            <Reveal as="li" key={item.title} delay={index * 80}>
              <div className="relative h-full overflow-hidden rounded-2xl border border-dashed border-[#b45309]/25 bg-[#fffdf6] p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#b45309]/20 bg-[#b45309]/[0.07] text-[#b45309]">
                    <Sparkles className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b45309]/25 bg-[#b45309]/[0.07] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#92400e]">
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#b45309]" />
                    {item.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold leading-snug tracking-tight text-[#0d1f18]">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#384940]">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={120}>
          <p className="mt-6 flex items-start gap-2 text-[11px] leading-relaxed text-[#384940]">
            <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#12664F]" />
            {t.roadmap.footnote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
