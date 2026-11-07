'use client';

import { featureIcons } from './icons';
import { Reveal, SectionHead } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function Trust() {
  const { t } = useLandingCopy();

  return (
    <section
      id="trust"
      className="bv-ink-section relative scroll-mt-20 py-24 sm:py-32"
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <Reveal>
            <SectionHead eyebrow={t.trust.eyebrow} title={t.trust.title} lead={t.trust.lead} tone="dark" />
            <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs leading-relaxed text-[#9db3a8]">{t.trust.extra}</p>
            </div>
          </Reveal>

          <ul className="grid gap-4 sm:grid-cols-2">
            {t.trust.items.map((item, index) => {
              const Icon = featureIcons[item.icon] ?? featureIcons.lock;
              return (
                <Reveal as="li" key={item.title} delay={index * 70}>
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-colors duration-200 hover:border-[#8fe9c4]/30 hover:bg-white/[0.04]">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#8fe9c4]/20 bg-[#8fe9c4]/10 text-[#8fe9c4]">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-[#f2faf6]">{item.title}</h3>
                    <p className="mt-2 text-pretty text-xs leading-relaxed text-[#9db3a8]">{item.body}</p>
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
