'use client';

import { featureIcons } from './icons';
import { Reveal, SectionHead } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function Trust() {
  const { t } = useLandingCopy();

  return (
    <section
      id="trust"
      className="bv-ink-section bv-grain relative scroll-mt-20 overflow-hidden py-24 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_15%_10%,rgba(45,194,189,0.18),transparent_70%)]"
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <Reveal>
            <SectionHead eyebrow={t.trust.eyebrow} title={t.trust.title} lead={t.trust.lead} tone="dark" />
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8c468]" />
              <p className="text-[12px] leading-relaxed text-[#9db3a8]">{t.trust.extra}</p>
            </div>
          </Reveal>

          <ul className="grid gap-3 sm:grid-cols-2">
            {t.trust.items.map((item, index) => {
              const Icon = featureIcons[item.icon] ?? featureIcons.lock;
              return (
                <Reveal as="li" key={item.title} delay={index * 70}>
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition-colors duration-300 hover:border-[#7ff0c2]/30 hover:bg-white/[0.05]">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#7ff0c2]/20 bg-[#7ff0c2]/10 text-[#7ff0c2]">
                      <Icon className="h-4 w-4" strokeWidth={1.7} />
                    </span>
                    <h3 className="mt-4 text-[14px] font-medium text-[#f2faf6]">{item.title}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-[#9db3a8]">{item.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
