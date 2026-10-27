'use client';

import { featureIcons } from './icons';
import { Reveal, SectionHead } from './primitives';
import { useLandingCopy } from './use-landing-copy';
import { cn } from '@/lib/utils';

export default function FeatureGrid() {
  const { t } = useLandingCopy();

  return (
    <section id="features" className="bv-paper relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHead eyebrow={t.features.eyebrow} title={t.features.title} lead={t.features.lead} />
        </Reveal>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((item, index) => {
            const Icon = featureIcons[item.icon] ?? featureIcons.building;
            const featured = index === 0;
            return (
              <Reveal
                as="li"
                key={item.title}
                delay={Math.min(index * 45, 270)}
                className={cn(featured && 'sm:col-span-2')}
              >
                <div
                  className={cn(
                    'group flex h-full flex-col rounded-2xl border border-[#0d1f18]/8 bg-white/70 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#12664F]/25 hover:bg-white hover:shadow-[0_24px_60px_-40px_rgba(13,31,24,0.5)]',
                    featured && 'sm:flex-row sm:items-start sm:gap-5',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#12664F]/12 bg-[#12664F]/[0.06] text-[#12664F] transition-colors group-hover:bg-[#12664F]/10',
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                  </span>
                  <div className={cn('mt-4 flex-1', featured && 'sm:mt-0')}>
                    <h3 className="text-[15px] font-semibold tracking-tight text-[#0d1f18]">{item.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#384940]">{item.body}</p>
                    <p className="mt-3 inline-flex rounded-full border border-[#12664F]/12 bg-[#12664F]/[0.04] px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-[#12664F]">
                      {item.tag}
                    </p>
                  </div>
                  {featured ? (
                    <div aria-hidden="true" className="mt-5 grid w-full shrink-0 grid-cols-8 gap-1 sm:mt-0 sm:w-40 sm:grid-cols-4">
                      {Array.from({ length: 24 }).map((__, cell) => {
                        const vacant = cell === 5 || cell === 10 || cell === 23;
                        const pending = cell === 14;
                        return (
                          <span
                            key={cell}
                            className={cn(
                              'aspect-[4/3] rounded-[2px]',
                              vacant
                                ? 'bg-[#0d1f18]/[0.06]'
                                : pending
                                  ? 'bg-[#b45309]/30'
                                  : cell % 3 === 0
                                    ? 'bg-[#12664F]/35'
                                    : 'bg-[#12664F]/20',
                            )}
                          />
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
