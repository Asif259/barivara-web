'use client';

import { useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import BuildingScene from './BuildingScene';
import { LandingCta, StatusPill } from './primitives';
import { useLandingCopy } from './use-landing-copy';
import { cn } from '@/lib/utils';

export default function Hero() {
  const { t } = useLandingCopy();
  const tags = t.sceneVisuals.unitTags;
  const progressRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      progressRef.current = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="hero" className="bv-vignette relative isolate overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-full opacity-45 lg:w-[64%] lg:opacity-100">
        <BuildingScene progress={progressRef} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#05100c] to-transparent" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,16,12,0.55)_0%,rgba(5,16,12,0.82)_45%,#05100c_100%)] lg:bg-[linear-gradient(90deg,#05100c_0%,#05100c_36%,rgba(5,16,12,0.75)_54%,rgba(5,16,12,0.15)_80%,transparent_100%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-5 pb-20 pt-28 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          <div className="max-w-xl lg:max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#9db3a8]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#7ff0c2] bv-blink" />
              {t.hero.eyebrow}
            </p>

            <h1 className="mt-6 text-[#f2faf6]">
              <span className="block text-[clamp(2.4rem,5.6vw,4.35rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
                {t.hero.title[0]}
              </span>
              <span className="mt-1 block text-[clamp(2.1rem,4.9vw,3.7rem)] font-light leading-[1.08] tracking-[-0.035em] text-[#a9e8cd]">
                {t.hero.title[1]}
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-[#b9cdc4] sm:text-base">{t.hero.lead}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LandingCta href="/register">
                {t.hero.primaryCta}
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </LandingCta>
              <LandingCta href="/login" variant="ghost">
                {t.hero.secondaryCta}
              </LandingCta>
            </div>

            <p className="mt-6 text-[12px] tracking-wide text-[#7f978c]">{t.hero.support}</p>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#6f887d]">{t.hero.legend.title}</span>
              {(['paid', 'partial', 'pending', 'overdue', 'vacant'] as const).map((tone) => (
                <span key={tone} className="inline-flex items-center gap-1.5 text-[11px] text-[#a9bdb3]">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      tone === 'paid' && 'bg-[#5ef29a]',
                      tone === 'partial' && 'bg-[#f0c05a]',
                      tone === 'pending' && 'bg-[#9ec9ff]',
                      tone === 'overdue' && 'bg-[#ff8d7d]',
                      tone === 'vacant' && 'bg-[#4b5f57]',
                    )}
                  />
                  {t.hero.legend[tone]}
                </span>
              ))}
            </div>
          </div>


          {/* Floating unit cards over the scene */}
          <div className="relative hidden h-[420px] lg:block" aria-hidden="true">
            <div className="bv-float absolute right-2 top-4 w-56 rounded-2xl border border-white/12 bg-[#071a14]/80 p-4 backdrop-blur-md">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-medium text-[#e9f3ee]">{tags[0].name}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#7f978c]">{tags[0].type}</p>
                </div>
                <StatusPill label={tags[0].status} tone={tags[0].tone} onDark />
              </div>
              <div className="mt-3 h-px bg-white/10" />
              <p className="mt-2.5 flex items-baseline gap-1 text-[15px] font-semibold text-[#f2faf6]">
                ৳13,300
                <span className="text-[10px] font-normal text-[#7f978c]">/ {t.sceneVisuals.rent.heading}</span>
              </p>
            </div>

            <div
              className="bv-float absolute right-24 top-[190px] w-56 rounded-2xl border border-white/12 bg-[#071a14]/80 p-4 backdrop-blur-md"
              style={{ animationDelay: '1.4s' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-medium text-[#e9f3ee]">{tags[1].name}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#7f978c]">{tags[1].type}</p>
                </div>
                <StatusPill label={tags[1].status} tone={tags[1].tone} onDark />
              </div>
              <div className="mt-3 h-px bg-white/10" />
              <p className="mt-2.5 text-[12px] text-[#a9bdb3]">
                {t.sceneVisuals.tenant.name} · {t.sceneVisuals.agreement.status}
              </p>
            </div>

            <div
              className="bv-float absolute right-6 top-[318px] w-48 rounded-2xl border border-white/12 bg-[#071a14]/80 p-3.5 backdrop-blur-md"
              style={{ animationDelay: '2.6s' }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-medium text-[#e9f3ee]">{tags[2].name}</p>
                <StatusPill label={tags[2].status} tone="vacant" onDark />
              </div>
            </div>

            <p className="absolute bottom-4 right-6 text-[10px] uppercase tracking-[0.18em] text-[#5f776c]">
              {t.sceneVisuals.unitTagNote}
            </p>
          </div>
        </div>

        <div className="mt-16 flex max-w-xl items-center gap-4">
          <span className="relative flex h-10 w-5 items-start justify-center rounded-full border border-white/20">
            <span aria-hidden="true" className="mt-1.5 h-2 w-0.5 rounded-full bg-[#7ff0c2] bv-blink" />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#7f978c]">{t.hero.scrollHint}</span>
            <ArrowDown className="h-3.5 w-3.5 text-[#7ff0c2]" aria-hidden="true" />
          </div>
        </div>
      </div>

      <p className="absolute inset-x-5 bottom-5 z-10 flex justify-end text-[10px] uppercase tracking-[0.2em] text-[#5f776c] sm:inset-x-8">
        {t.common.sampleData}
      </p>
    </section>
  );
}
