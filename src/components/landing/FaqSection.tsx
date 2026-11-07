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
    <section id="faq" className="relative scroll-mt-20 bg-[#071611] py-24 text-[#e9f3ee] sm:py-32">
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
          <div className="divide-y divide-white/[0.08] rounded-2xl border border-white/10 bg-white/[0.025] px-6 sm:px-8">
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
                    className="group flex w-full items-center justify-between gap-4 py-4 text-left transition-colors duration-150 hover:text-[#8fe9c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fe9c4]"
                  >
                    <span className="text-base font-semibold leading-snug">
                      {item.q}
                    </span>
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 text-[#9db3a8] transition-colors duration-150 group-hover:border-[#8fe9c4]/30 group-hover:text-[#8fe9c4] ${
                        isOpen ? 'rotate-180 border-[#8fe9c4]/40 text-[#8fe9c4]' : ''
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
                      <p className="pb-5 pt-1 text-pretty text-sm leading-relaxed text-[#9db3a8]">
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
          <div className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:flex-row sm:p-7">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366]">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#f3fbf7] sm:text-base">
                  {t.faq.contactPrompt}
                </p>
                <p className="mt-1 text-xs text-[#829c90]">
                  {t.faq.whatsappNumber}, {t.footer.whatsappSupport}
                </p>
              </div>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-5 text-sm font-semibold text-[#25D366] transition-colors duration-150 active:scale-[0.98] hover:bg-[#25D366]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
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
