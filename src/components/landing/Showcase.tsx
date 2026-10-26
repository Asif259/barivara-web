'use client';

import { Check, Languages } from './icons';
import { Reveal, SectionHead } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function Showcase() {
  const { t, lang } = useLandingCopy();
  const notice = t.showcase.notice;

  return (
    <section id="showcase" className="relative scroll-mt-20 overflow-hidden bg-[#f6f3ea] py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(50%_50%_at_70%_45%,rgba(18,102,79,0.10),transparent_75%)]"
      />
      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal>
          <SectionHead eyebrow={t.showcase.eyebrow} title={t.showcase.title} lead={t.showcase.lead} />

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-[#0d1f18]/10 bg-white/70 p-1">
            <Languages className="ml-2 h-3.5 w-3.5 text-[#5c6f66]" aria-hidden="true" />
            <span className="px-1 text-[10px] uppercase tracking-[0.16em] text-[#5c6f66]">{t.showcase.languageLabel}</span>
            <span className="rounded-full bg-[#12664F] px-2.5 py-1 text-[11px] text-white">বাংলা</span>
            <span className="rounded-full border border-[#0d1f18]/10 px-2.5 py-1 text-[11px] text-[#5c6f66]">English</span>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {t.showcase.points.map((point, index) => (
              <Reveal as="li" key={point.title} delay={index * 70} className="flex gap-2.5">
                <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#12664F]/10 text-[#12664F]">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-[#0d1f18]">{point.title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-[#5c6f66]">{point.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={100} className="relative">
          <div className="pointer-events-none absolute -left-4 top-6 hidden rotate-[-6deg] rounded-lg border border-[#0d1f18]/10 bg-white px-3 py-2 shadow-lg lg:block">
            <p className="text-[9px] uppercase tracking-[0.18em] text-[#8a7d5d]">{t.sceneVisuals.receipt.heading}</p>
            <p className="mt-1 text-[13px] font-semibold tabular-nums text-[#0d1f18]">{t.sceneVisuals.receipt.amount}</p>
            <p className="text-[8px] text-[#8a7d5d]">{t.sceneVisuals.receipt.date}</p>
          </div>

          <article className="bv-doc relative mx-auto w-full max-w-[420px] rotate-[-1.2deg] rounded-sm px-7 py-8 text-[#1f2a24]">
            <div className="flex items-start justify-between gap-4 border-b border-[#0d1f18]/10 pb-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.24em] text-[#8a7d5d]">{notice.sampleNotice}</p>
                <h3 className="mt-1.5 text-[17px] font-semibold tracking-tight">{notice.heading}</h3>
                <p className="mt-0.5 text-[11px] text-[#6b7280]">{notice.landlord}</p>
              </div>
              <div className="text-right">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" className="ml-auto h-8 w-8 rounded object-contain" />
                <p className="mt-1.5 text-[10px] text-[#6b7280]">{notice.period}</p>
              </div>
            </div>

            <dl className="mt-4 space-y-2.5 text-[11px]">
              {notice.rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-3 border-b border-dashed border-[#d8cfb8] pb-1.5">
                  <dt className="text-[#6b7280]">{row.label}</dt>
                  <dd className="font-medium tabular-nums text-[#1f2a24]">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex items-baseline justify-between rounded bg-[#12664F]/[0.06] px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#12664F]">{notice.totalLabel}</span>
              <span className="text-[20px] font-semibold tabular-nums tracking-tight text-[#12664F]">{notice.total}</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-[#6b7280]">
              <span>{notice.dueLabel}</span>
              <span className="font-medium text-[#1f2a24]">{notice.due}</span>
            </div>

            <div className="mt-10 flex items-end justify-between">
              <span className="inline-flex items-center gap-1 text-[9px] text-[#8a7d5d]">
                <span className="h-1 w-1 rounded-full bg-[#12664F]" />
                {t.common.sampleDataShort}
              </span>
              <div className="text-center">
                <div className="h-6 w-28 border-b border-[#0d1f18]/25" />
                <p className="mt-1 text-[9px] text-[#6b7280]">{notice.signature}</p>
              </div>
            </div>

            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[8px] uppercase tracking-[0.3em] text-[#0d1f18]/15">
              A4 · {lang === 'bn' ? 'প্রিন্ট-রেডি' : 'print-ready'}
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
