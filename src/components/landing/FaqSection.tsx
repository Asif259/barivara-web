'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircle } from './icons';
import { Reveal, SectionHead } from './primitives';
import { useLandingCopy } from './use-landing-copy';

export default function FaqSection() {
  const { t } = useLandingCopy();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  const whatsappHref = `https://wa.me/${t.faq.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    t.faq.whatsappMessage,
  )}`;

  return (
    <section id="faq" className="relative scroll-mt-20 overflow-hidden bg-[#071611] py-24 text-[#e9f3ee] sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(45,194,189,0.14),transparent_70%)]"
      />
      <div className="relative mx-auto w-full max-w-4xl px-5 sm:px-8">
        <Reveal>
          <SectionHead
            eyebrow={t.faq.eyebrow}
            title={t.faq.title}
            lead={t.faq.lead}
            tone="dark"
            align="center"
          />
        </Reveal>

        {/* Accordion List */}
        <Reveal delay={80} className="mt-12 sm:mt-16">
          <div className="divide-y divide-white/[0.08] rounded-2xl border border-white/10 bg-white/[0.025] px-5 sm:px-8">
            {t.faq.items.map((item, index) => {
              const isOpen = openIndex === index;
              const questionId = `faq-q-${index}`;
              const answerId = `faq-a-${index}`;

              return (
                <div key={item.q} className="py-2">
                  <button
                    id={questionId}
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    className="group flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-[#7ff0c2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ff0c2]"
                  >
                    <span className="text-[15px] font-medium leading-snug sm:text-[16px]">
                      {item.q}
                    </span>
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 text-[#9db3a8] transition-all duration-200 group-hover:border-[#7ff0c2]/30 group-hover:text-[#7ff0c2] ${
                        isOpen ? 'rotate-180 border-[#7ff0c2]/40 text-[#7ff0c2]' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>

                  <div
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 pt-1 text-[13.5px] leading-relaxed text-[#9db3a8] sm:text-[14px]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* WhatsApp & Human Support Prompt */}
        <Reveal delay={120} className="mt-8 sm:mt-10">
          <div className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-[#0a271e]/40 p-6 sm:flex-row sm:p-7">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#25D366]/30 bg-[#25D366]/15 text-[#25D366]">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[14px] font-medium text-[#f3fbf7] sm:text-[15px]">
                  {t.faq.contactPrompt}
                </p>
                <p className="mt-0.5 text-[12px] text-[#829c90]">
                  {t.faq.whatsappNumber} · {t.footer.whatsappSupport}
                </p>
              </div>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/20 px-5 text-[13.5px] font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
            >
              <MessageCircle className="h-4 w-4" />
              {t.faq.whatsappButton}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
