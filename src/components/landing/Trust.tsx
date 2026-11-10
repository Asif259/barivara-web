'use client';

import { featureIcons } from './icons';
import { Reveal, SectionHead } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function Trust() {
  const { t } = useLandingCopy();

  return (
    <section
      id="trust"
      className="bv-paper relative scroll-mt-20 border-t border-[#0d1f18]/10 py-24 sm:py-32"
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <Reveal>
            <SectionHead eyebrow={t.trust.eyebrow} title={t.trust.title} lead={t.trust.lead} tone="light" />
            <div className="mt-8 rounded-xl border border-[#0d1f18]/10 bg-[#efeade]/60 p-4">
              <p className="text-xs leading-relaxed text-[#384940]">{t.trust.extra}</p>
            </div>
          </Reveal>

          <ul className="grid gap-4 sm:grid-cols-2">
            {t.trust.items.map((item, index) => {
              const Icon = featureIcons[item.icon] ?? featureIcons.lock;
              return (
                <Reveal as="li" key={item.title} delay={index * 70}>
                  <div className="h-full rounded-2xl border border-[#0d1f18]/10 bg-white p-6 shadow-sm transition-all duration-200 hover:border-[#12664F]/30 hover:shadow-md">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#12664F]/20 bg-[#12664F]/10 text-[#12664F]">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-[#0d1f18]">{item.title}</h3>
                    <p className="mt-2 text-pretty text-xs leading-relaxed text-[#5c6f65]">{item.body}</p>
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
