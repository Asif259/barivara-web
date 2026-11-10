'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, CheckCircle2, FileSpreadsheet, ShieldAlert, Zap, MessageSquare } from 'lucide-react';
import { ProductModuleItem, SupportedLocale } from './landing-types';

interface LandingShowcaseProps {
  locale: SupportedLocale;
  modules: ProductModuleItem[];
  onSelectModule: (module: ProductModuleItem) => void;
}

export const LandingShowcase: React.FC<LandingShowcaseProps> = ({
  locale,
  modules,
  onSelectModule,
}) => {
  const isBn = locale === 'bn';

  if (!modules || modules.length === 0) {
    return (
      <section id="properties" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-14 max-w-6xl mx-auto text-center">
        <p className="text-gray-400 text-sm">
          {isBn ? 'কোনো মডিউল পাওয়া যায়নি। ফিল্টার রিসেট করুন।' : 'No management module matched your criteria.'}
        </p>
      </section>
    );
  }

  const card1 = modules[0];
  const card2 = modules[1] || modules[0];
  const card3 = modules[2] || modules[0];
  const card4 = modules[3] || modules[0];
  const card5 = modules[4] || modules[0];

  return (
    <section id="properties" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-14 max-w-6xl mx-auto">
      {/* Section Heading */}
      <div className="text-center mb-12">
        <p className="text-xs text-gray-400 mb-1.5 font-medium">
          {isBn ? 'কোর ফিচার ও ব্যবস্থাপনা মডিউল' : 'Core Product Capabilities'}
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
          {isBn ? 'কাগজের খাতার ঝামেলাহীন পূর্ণাঙ্গ সমাধান' : 'Built for the Realities of Bangladeshi Tenancy'}
        </h2>
      </div>

      {/* 12-Column Staggered Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT + CENTER 8 COLUMNS */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* TOP SUB-ROW: Card 1 (Wider Left) + Card 2 (Compact Center) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* CARD 1: Top-Left Medium-Wide (WhatsApp Receipts) */}
            {card1 && (
              <article
                onClick={() => onSelectModule(card1)}
                className="prop-card md:col-span-7 group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[16/10] mb-3 border border-white/10 group-hover:border-[#10b981]/50 transition-colors">
                  <Image
                    src={card1.imageUrl}
                    alt={card1.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="prop-img object-cover transition-transform duration-500 ease-out"
                  />
                  <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[11px] px-2.5 py-1 rounded text-[#10b981] border border-[#10b981]/30 font-medium">
                    {isBn ? card1.badgeBn : card1.badge}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 bg-[#111214]/90 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 text-[11px] text-gray-200 flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    <span className="truncate">{isBn ? card1.sampleUiSnippetBn : card1.sampleUiSnippetEn}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#10b981] transition-colors duration-150">
                    {isBn ? card1.titleBn : card1.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                    {(isBn ? card1.specsBn : card1.specs).slice(0, 3).map((spec, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#10b981]">
                      {isBn ? card1.highlightMetricBn : card1.highlightMetric}
                    </span>
                    <button
                      aria-label={`View ${card1.title}`}
                      className="arrow-btn w-7 h-7 bg-[#12664F] text-white hover:bg-[#10b981] hover:text-[#111214] flex items-center justify-center rounded-sm transition-[background-color,color] duration-150"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* CARD 2: Top-Center Compact (Utility Splits) */}
            {card2 && (
              <article
                onClick={() => onSelectModule(card2)}
                className="prop-card md:col-span-5 md:mt-8 group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[4/3] mb-3 border border-white/10 group-hover:border-[#10b981]/50 transition-colors">
                  <Image
                    src={card2.imageUrl}
                    alt={card2.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="prop-img object-cover transition-transform duration-500 ease-out"
                  />
                  <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[11px] px-2.5 py-1 rounded text-gray-200 border border-white/10 font-medium">
                    {isBn ? card2.badgeBn : card2.badge}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 bg-[#111214]/90 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 text-[11px] text-gray-200 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    <span className="truncate">{isBn ? 'ডেসকো/ডিপিডিসি হিসাব' : 'Sub-Meter Math'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#10b981] transition-colors duration-150">
                    {isBn ? card2.titleBn : card2.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                    {(isBn ? card2.specsBn : card2.specs).slice(0, 2).map((spec, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#10b981]">
                      {isBn ? card2.highlightMetricBn : card2.highlightMetric}
                    </span>
                    <button
                      aria-label={`View ${card2.title}`}
                      className="arrow-btn w-7 h-7 bg-[#12664F] text-white hover:bg-[#10b981] hover:text-[#111214] flex items-center justify-center rounded-sm transition-[background-color,color] duration-150"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )}

          </div>

          {/* BOTTOM SUB-ROW: Card 4 (bKash Dues) + Card 5 (Income-Expense Khata) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* CARD 4: Bottom-Left Compact (bKash & Overdue Tracking) */}
            {card4 && (
              <article
                onClick={() => onSelectModule(card4)}
                className="prop-card md:col-span-5 md:mt-6 group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[4/3] mb-3 border border-white/10 group-hover:border-[#10b981]/50 transition-colors">
                  <Image
                    src={card4.imageUrl}
                    alt={card4.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="prop-img object-cover transition-transform duration-500 ease-out"
                  />
                  <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[11px] px-2.5 py-1 rounded text-gray-200 border border-white/10 font-medium">
                    {isBn ? card4.badgeBn : card4.badge}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 bg-[#111214]/90 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 text-[11px] text-gray-200 flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    <span className="truncate">{isBn ? 'বিকাশ ও নগদ TrxID' : 'bKash TrxID Logger'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#10b981] transition-colors duration-150">
                    {isBn ? card4.titleBn : card4.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                    {(isBn ? card4.specsBn : card4.specs).slice(0, 2).map((spec, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#10b981]">
                      {isBn ? card4.highlightMetricBn : card4.highlightMetric}
                    </span>
                    <button
                      aria-label={`View ${card4.title}`}
                      className="arrow-btn w-7 h-7 bg-[#12664F] text-white hover:bg-[#10b981] hover:text-[#111214] flex items-center justify-center rounded-sm transition-[background-color,color] duration-150"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* CARD 5: Bottom-Center Wide (Income-Expense Khata) */}
            {card5 && (
              <article
                onClick={() => onSelectModule(card5)}
                className="prop-card md:col-span-7 group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[16/10] mb-3 border border-white/10 group-hover:border-[#10b981]/50 transition-colors">
                  <Image
                    src={card5.imageUrl}
                    alt={card5.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="prop-img object-cover transition-transform duration-500 ease-out"
                  />
                  <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[11px] px-2.5 py-1 rounded text-gray-200 border border-white/10 font-medium">
                    {isBn ? card5.badgeBn : card5.badge}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 bg-[#111214]/90 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 text-[11px] text-gray-200 flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    <span className="truncate">{isBn ? card5.sampleUiSnippetBn : card5.sampleUiSnippetEn}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#10b981] transition-colors duration-150">
                    {isBn ? card5.titleBn : card5.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                    {(isBn ? card5.specsBn : card5.specs).slice(0, 3).map((spec, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#10b981]">
                      {isBn ? card5.highlightMetricBn : card5.highlightMetric}
                    </span>
                    <button
                      aria-label={`View ${card5.title}`}
                      className="arrow-btn w-7 h-7 bg-[#12664F] text-white hover:bg-[#10b981] hover:text-[#111214] flex items-center justify-center rounded-sm transition-[background-color,color] duration-150"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )}

          </div>
        </div>

        {/* RIGHT 4 COLUMNS: CARD 3 (Tenant Directory & Police Form - Tall Vertical) */}
        {card3 && (
          <article
            onClick={() => onSelectModule(card3)}
            className="prop-card lg:col-span-4 lg:-mt-4 group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[3/4.3] mb-3 border border-white/10 group-hover:border-[#10b981]/50 transition-colors">
              <Image
                src={card3.imageUrl}
                alt={card3.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="prop-img object-cover transition-transform duration-500 ease-out"
              />
              <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[11px] px-2.5 py-1 rounded text-[#10b981] border border-[#10b981]/30 font-medium">
                {isBn ? card3.badgeBn : card3.badge}
              </span>
              <div className="absolute bottom-3 left-3 right-3 bg-[#111214]/90 backdrop-blur-md px-3 py-2 rounded border border-white/10 text-[11px] text-gray-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#10b981] shrink-0" />
                <span className="truncate">{isBn ? 'ডিএমপি ভাড়াটিয়া তথ্য ফরম' : 'DMP Police Form Export'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white group-hover:text-[#10b981] transition-colors duration-150">
                {isBn ? card3.titleBn : card3.title}
              </h3>
              <div className="flex flex-col gap-1.5 text-[11px] text-gray-400">
                {(isBn ? card3.specsBn : card3.specs).map((spec, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                    {spec}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-[#10b981]">
                  {isBn ? card3.highlightMetricBn : card3.highlightMetric}
                </span>
                <button
                  aria-label={`View ${card3.title}`}
                  className="arrow-btn w-7 h-7 bg-[#12664F] text-white hover:bg-[#10b981] hover:text-[#111214] flex items-center justify-center rounded-sm transition-[background-color,color] duration-150"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        )}

      </div>
    </section>
  );
};
