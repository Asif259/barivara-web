'use client';

import { CalendarDays } from './icons';
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
              <div className="relative h-full overflow-hidden rounded-2xl border border-[#0d1f18]/10 bg-white/80 p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#b45309]/20 bg-[#b45309]/[0.06] text-[#b45309]">
                    <CalendarDays className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#b45309]/20 bg-[#b45309]/[0.06] px-3 py-1 text-xs font-semibold text-[#92400e]">
                    {item.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold leading-snug tracking-normal text-[#0d1f18]">{item.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-[#384940]">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={120}>
          <p className="mt-6 text-xs leading-relaxed text-[#5c6f65]">
            {t.roadmap.footnote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
