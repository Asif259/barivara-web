'use client';

import { LandingCta } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function FinalCta() {
  const { t } = useLandingCopy();

  return (
    <section className="bv-ink-section relative isolate border-t border-white/[0.08]">
      <div className="relative z-10 mx-auto w-full max-w-[680px] px-5 py-24 text-center sm:px-8 sm:py-32">
        <p className="text-xs font-semibold text-[#8fe9c4]">{t.finalCta.eyebrow}</p>
        <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-normal text-[#f2faf6] sm:text-4xl lg:text-5xl">
          {t.finalCta.title}
        </h2>
        <p className="mt-2 text-balance text-lg font-medium text-[#8fe9c4] sm:text-xl">
          {t.finalCta.titleAlt}
        </p>
        <p className="mx-auto mt-4 text-pretty text-sm leading-relaxed text-[#9db3a8] sm:text-base">
          {t.finalCta.lead}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LandingCta href="/register">{t.finalCta.primary}</LandingCta>
          <LandingCta href="/login" variant="ghost">
            {t.finalCta.secondary}
          </LandingCta>
        </div>
        <p className="mt-4 text-xs text-[#829c90]">{t.finalCta.note}</p>
      </div>
    </section>
  );
}
