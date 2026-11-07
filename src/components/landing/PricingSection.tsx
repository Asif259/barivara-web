'use client';

import Link from 'next/link';
import { Check } from './icons';
import { Reveal, SectionHead } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function PricingSection() {
  const { t } = useLandingCopy();
  const pricing = t.pricing;

  return (
    <section id="pricing" className="bv-paper relative scroll-mt-20 border-t border-[#0d1f18]/10 py-24 sm:py-32">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHead
            eyebrow={pricing.eyebrow}
            title={pricing.title}
            lead={pricing.lead}
            align="center"
          />
        </Reveal>

        <Reveal delay={80} className="mx-auto mt-12 max-w-xl">
          <div className="rounded-2xl border border-[#0d1f18]/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold tracking-normal text-[#0d1f18]">
                  {pricing.planName}
                </h3>
                <p className="mt-1 text-xs text-[#5c6f65]">{pricing.period}</p>
              </div>
              <span className="inline-flex rounded-full border border-[#12664F]/20 bg-[#12664F]/[0.06] px-3 py-1 text-xs font-medium text-[#12664F]">
                {pricing.badge}
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-1 border-b border-[#0d1f18]/10 pb-6">
              <span className="text-2xl font-semibold text-[#0d1f18]">{pricing.currency}</span>
              <span className="text-5xl font-bold tracking-tight text-[#0d1f18]">{pricing.price}</span>
              <span className="ml-2 text-sm text-[#5c6f65]">/ {pricing.period}</span>
            </div>

            <ul className="mt-6 space-y-3">
              {pricing.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-[#384940]">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#12664F]/10 text-[#12664F]">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border border-[#12664F]/15 bg-[#12664F]/[0.04] p-4">
              <p className="text-xs font-semibold text-[#12664F]">{pricing.pledgeTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#384940]">{pricing.pledge}</p>
            </div>

            <Link
              href="/register"
              className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#12664F] px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#0e513f] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664F] focus-visible:ring-offset-2"
            >
              {pricing.cta}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

