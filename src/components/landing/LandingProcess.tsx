'use client';

import React from 'react';
import Image from 'next/image';
import { LayoutGrid, FileText, CheckCircle2 } from 'lucide-react';
import { PROCESS_STEPS } from './landing-data';
import { SupportedLocale } from './landing-types';

interface LandingProcessProps {
  locale: SupportedLocale;
}

export const LandingProcess: React.FC<LandingProcessProps> = ({ locale }) => {
  const isBn = locale === 'bn';

  return (
    <section id="process" className="py-16 sm:py-24 px-4 sm:px-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d9ff43]" />
          <span>{isBn ? 'কীভাবে কাজ করে' : 'How It Works'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug">
          {isBn ? (
            <>কাগজের খাতা থেকে শান্ত ও সুশৃঙ্খল<br />ডিজিটাল ভাড়া ব্যবস্থাপনা</>
          ) : (
            <>A calm, considered path to<br />effortless rental management</>
          )}
        </h2>
      </div>

      {/* Vertical Stack of 4 Circular Steps */}
      <div className="space-y-8 sm:space-y-10 max-w-xl mx-auto">
        {PROCESS_STEPS.map((step, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left group"
          >
            {/* Step Visual Node */}
            {step.iconType === 'photo' && step.imageBadgeUrl ? (
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#d9ff43]/40 shrink-0 shadow-lg">
                <Image
                  src={step.imageBadgeUrl}
                  alt={isBn ? step.titleBn : step.titleEn}
                  fill
                  sizes="128px"
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#1f2126] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#d9ff43] transition-colors duration-200">
                {step.iconType === 'grid' && (
                  <LayoutGrid className="w-9 h-9 text-[#d9ff43]" />
                )}
                {step.iconType === 'contract' && (
                  <FileText className="w-9 h-9 text-[#d9ff43]" />
                )}
                {step.iconType === 'key' && (
                  <CheckCircle2 className="w-9 h-9 text-[#d9ff43]" />
                )}
              </div>
            )}

            {/* Step Text Info */}
            <div>
              <div className="text-[10px] font-mono text-[#d9ff43] font-bold tracking-wider mb-0.5">
                STEP {step.number}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white mb-1.5">
                {isBn ? step.titleBn : step.titleEn}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                {isBn ? step.descBn : step.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

