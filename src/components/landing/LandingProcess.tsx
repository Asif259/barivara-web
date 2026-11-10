'use client';

import React from 'react';
import Image from 'next/image';
import { Building2, Users, FileText, MessageSquare } from 'lucide-react';
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
        <p className="text-xs text-gray-400 mb-1.5 font-medium">
          {isBn ? 'সহজ ৪-ধাপের প্রক্রিয়া' : '4-Step Landlord Workflow'}
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug">
          {isBn ? (
            <>কাগজের খাতার ঝামেলাহীন শান্ত ও সুশৃঙ্খল<br />ডিজিটাল ভাড়া ব্যবস্থাপনা</>
          ) : (
            <>A calm, reliable workflow built for<br />on-time rent collection</>
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
            {step.iconType === 'users' && step.imageBadgeUrl ? (
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#10b981]/40 shrink-0 shadow-lg group-hover:border-[#10b981] transition-colors duration-200">
                <Image
                  src={step.imageBadgeUrl}
                  alt={isBn ? step.titleBn : step.titleEn}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#1f2126] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#10b981] transition-colors duration-200">
                {step.iconType === 'building' && (
                  <Building2 className="w-9 h-9 text-[#10b981]" />
                )}
                {step.iconType === 'users' && (
                  <Users className="w-9 h-9 text-[#10b981]" />
                )}
                {step.iconType === 'invoice' && (
                  <FileText className="w-9 h-9 text-[#10b981]" />
                )}
                {step.iconType === 'whatsapp' && (
                  <MessageSquare className="w-9 h-9 text-[#10b981]" />
                )}
              </div>
            )}

            {/* Step Text Info */}
            <div>
              <div className="text-xs text-[#10b981] font-semibold mb-0.5">
                {isBn ? `ধাপ ${step.number}` : `Step ${step.number}`}
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">
                {isBn ? step.titleBn : step.titleEn}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs sm:max-w-md">
                {isBn ? step.descBn : step.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
