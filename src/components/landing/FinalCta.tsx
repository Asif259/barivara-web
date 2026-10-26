'use client';

import { LandingCta } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function FinalCta() {
  const { t } = useLandingCopy();

  return (
    <section className="bv-ink-section relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(127,240,194,0.18),transparent_70%)]"
      />
      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#7ff0c2]">{t.finalCta.eyebrow}</p>
        <h2 className="mt-5 text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#f2faf6]">
          {t.finalCta.title}
        </h2>
        <p className="mt-2 text-[clamp(1.1rem,2.4vw,1.6rem)] font-light tracking-[-0.02em] text-[#a9e8cd]">
          {t.finalCta.titleAlt}
        </p>
        <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-[#9db3a8] sm:text-[15px]">
          {t.finalCta.lead}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <LandingCta href="/register">{t.finalCta.primary}</LandingCta>
          <LandingCta href="/login" variant="ghost">
            {t.finalCta.secondary}
          </LandingCta>
        </div>
        <p className="mt-5 text-[11px] text-[#5f776c]">{t.finalCta.note}</p>
      </div>

      <div aria-hidden="true" className="pointer-events-none relative z-10 mx-auto flex h-16 max-w-3xl items-end justify-center gap-1 px-5 opacity-60">
        {Array.from({ length: 26 }).map((_, index) => {
          const height = 18 + ((index * 37) % 42);
          const lit = index % 4 !== 0;
          return (
            <span
              key={index}
              className="w-full max-w-4 rounded-t-sm bg-[#0b241c]"
              style={{ height }}
            >
              <span
                className={lit ? 'block h-1 w-full rounded-t-sm bg-[#7ff0c2]/60' : 'block h-1 w-full rounded-t-sm bg-white/5'}
              />
            </span>
          );
        })}
      </div>
    </section>
  );
}
