'use client';

import React from 'react';
import Image from 'next/image';
import { Home, Layers, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { SupportedLocale } from './landing-types';

interface LandingHeroProps {
  locale: SupportedLocale;
  selectedType: string;
  selectedModule: string;
  selectedScale: string;
  onTypeChange: (val: string) => void;
  onModuleChange: (val: string) => void;
  onScaleChange: (val: string) => void;
  onResetFilters: () => void;
  onSearch: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  locale,
  selectedType,
  selectedModule,
  selectedScale,
  onTypeChange,
  onModuleChange,
  onScaleChange,
  onResetFilters,
  onSearch,
}) => {
  const isBn = locale === 'bn';

  return (
    <section id="hero" className="relative w-full">
      {/* Bright Sky & Contemporary Architecture Container */}
      <div className="relative w-full h-[580px] sm:h-[650px] lg:h-[720px] overflow-hidden bg-[#c8dff0]">
        {/* Background Contemporary Residence & Property */}
        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
            alt="BariVara Landlord & Property Management"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-105 contrast-105"
          />
        </div>

        {/* Sky upper gradient so giant typography pops cleanly like screenshot */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#e8f1f8]/90 via-transparent to-[#16171a] pointer-events-none" />

        {/* Giant Hero Display Title Across the Top Sky */}
        <div className="absolute top-5 sm:top-7 inset-x-0 flex justify-center pointer-events-none px-4">
          <h1 className="hero-giant-title text-[15vw] sm:text-[13vw] lg:text-[160px] tracking-[0.14em] text-center select-none drop-shadow-sm">
            {isBn ? 'BARIVARA' : 'BARIVARA'}
          </h1>
        </div>

        {/* Center-Left Floating Glassmorphic Info Overlay (Matches Screenshot) */}
        <div className="absolute left-6 sm:left-12 lg:left-24 top-1/2 -translate-y-6 max-w-xs sm:max-w-md bg-[#111214]/85 backdrop-blur-md border border-white/15 p-4 sm:p-5 rounded-lg shadow-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#10b981] font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>{isBn ? 'বাংলাদেশের বাড়িওয়ালাদের জন্য' : 'For Bangladeshi Landlords'}</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-100 font-medium leading-relaxed">
            {isBn
              ? 'কাগজের খাতার বিশৃঙ্খলা ভুলে বাড়ি ও ফ্ল্যাটের সম্পূর্ণ হিসাব রাখুন এক জায়গায়। ১-ক্লিকে হোয়াটসঅ্যাপ রসিদ, বিদ্যুৎ সাব-মিটার বিল বণ্টন ও বিকাশ/নগদ পেমেন্ট রিকনসিলিয়েশন।'
              : 'Eliminate manual paper ledger chaos, delayed rent collection, and contentious utility disputes. The only property-tech SaaS built specifically for Bangladeshi residential landlords.'}
          </p>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-300">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              {isBn ? '১–১৫ ইউনিটের বাড়িওয়ালাদের জন্য' : '1–15 Units per Landlord'}
            </span>
            <a href="#properties" className="text-[#10b981] font-semibold hover:underline flex items-center gap-1">
              <span>{isBn ? 'মডিউল দেখুন' : 'Explore Modules'}</span>
              <span>↓</span>
            </a>
          </div>
        </div>

        {/* Bottom Filter Bar Overlapping Hero Footer */}
        <div className="absolute bottom-0 inset-x-0 bg-[#16171a]/95 backdrop-blur-md border-t border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              
              {/* Filter 1: Property Type */}
              <div className="lg:col-span-3 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-white/10 pb-2 sm:pb-0 sm:pr-4">
                <div>
                  <label htmlFor="filter-prop-type" className="flex items-center gap-1.5 text-xs text-[#10b981] font-semibold cursor-pointer">
                    <Home className="w-3 h-3 text-[#10b981]" />
                    <span>{isBn ? 'প্রপার্টির ধরন' : 'Property Type'}</span>
                  </label>
                  <select
                    id="filter-prop-type"
                    aria-label={isBn ? 'প্রপার্টির ধরন নির্বাচন করুন' : 'Select Property Type'}
                    value={selectedType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    className="bg-transparent text-white text-xs font-medium focus:outline-none mt-0.5 cursor-pointer pr-2"
                  >
                    <option value="all" className="bg-[#1c1d21] text-white">
                      {isBn ? 'সকল প্রপার্টি ও ফ্ল্যাট' : 'All Residential Properties'}
                    </option>
                    <option value="residential" className="bg-[#1c1d21] text-white">
                      {isBn ? 'আবাসিক ফ্ল্যাট (ফ্যামিলি)' : 'Residential Flats'}
                    </option>
                    <option value="commercial" className="bg-[#1c1d21] text-white">
                      {isBn ? 'বাণিজ্যিক স্পেস ও দোকান' : 'Commercial Shops & Floors'}
                    </option>
                    <option value="sublet" className="bg-[#1c1d21] text-white">
                      {isBn ? 'সাবলেট ও মেস রুম' : 'Sublets & Rooms'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Filter 2: Capability / Primary Module */}
              <div className="lg:col-span-3 flex items-center justify-between border-b sm:border-b-0 lg:border-r border-white/10 pb-2 sm:pb-0 sm:pr-4">
                <div>
                  <label htmlFor="filter-module" className="flex items-center gap-1.5 text-xs text-[#10b981] font-semibold cursor-pointer">
                    <Layers className="w-3 h-3 text-[#10b981]" />
                    <span>{isBn ? 'প্রধান ফিচার' : 'Key Feature'}</span>
                  </label>
                  <select
                    id="filter-module"
                    aria-label={isBn ? 'প্রধান ফিচার নির্বাচন করুন' : 'Select Feature'}
                    value={selectedModule}
                    onChange={(e) => onModuleChange(e.target.value)}
                    className="bg-transparent text-white text-xs font-medium focus:outline-none mt-0.5 cursor-pointer pr-2"
                  >
                    <option value="all" className="bg-[#1c1d21] text-white">
                      {isBn ? 'সকল ফিচার দেখুন' : 'All Management Modules'}
                    </option>
                    <option value="Receipts" className="bg-[#1c1d21] text-white">
                      {isBn ? '১-ক্লিক হোয়াটসঅ্যাপ রসিদ' : 'WhatsApp Receipts & A4'}
                    </option>
                    <option value="Utilities" className="bg-[#1c1d21] text-white">
                      {isBn ? 'বিদ্যুৎ সাব-মিটার ও বিল বণ্টন' : 'Sub-Meter & Utilities'}
                    </option>
                    <option value="Tenants" className="bg-[#1c1d21] text-white">
                      {isBn ? 'ভাড়াটিয়া এনআইডি ও পুলিশ ফরম' : 'Tenant NID & Police Form'}
                    </option>
                    <option value="Payments" className="bg-[#1c1d21] text-white">
                      {isBn ? 'বিকাশ/নগদ ও বকেয়া হিসাব' : 'bKash/Nagad Dues Tracking'}
                    </option>
                    <option value="Ledger" className="bg-[#1c1d21] text-white">
                      {isBn ? 'আয়-ব্যয় খতিয়ান ও সিএসভি' : 'Income-Expense Khata'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Filter 3: Scale / Flat Range */}
              <div className="lg:col-span-3 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-white/10 pb-2 sm:pb-0 sm:pr-4">
                <div>
                  <label htmlFor="filter-scale" className="flex items-center gap-1.5 text-xs text-[#10b981] font-semibold cursor-pointer">
                    <Sparkles className="w-3 h-3 text-[#10b981]" />
                    <span>{isBn ? 'ইউনিট সংখ্যা' : 'Units Scale'}</span>
                  </label>
                  <select
                    id="filter-scale"
                    aria-label={isBn ? 'ইউনিট সংখ্যা নির্বাচন করুন' : 'Select Units Scale'}
                    value={selectedScale}
                    onChange={(e) => onScaleChange(e.target.value)}
                    className="bg-transparent text-white text-xs font-medium focus:outline-none mt-0.5 cursor-pointer pr-2 tabular-nums"
                  >
                    <option value="all" className="bg-[#1c1d21] text-white">
                      {isBn ? '১–১৫+ ইউনিট (সকল)' : '1–15+ Units (All)'}
                    </option>
                    <option value="small" className="bg-[#1c1d21] text-white">
                      {isBn ? '১–৫টি ফ্ল্যাট' : '1–5 Units'}
                    </option>
                    <option value="medium" className="bg-[#1c1d21] text-white">
                      {isBn ? '৬–১০টি ফ্ল্যাট' : '6–10 Units'}
                    </option>
                    <option value="large" className="bg-[#1c1d21] text-white">
                      {isBn ? '১১–১৫+ ফ্ল্যাট' : '11–15+ Units'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Filter 4: Actions */}
              <div className="lg:col-span-3 flex items-center justify-end gap-2">
                <button
                  onClick={onResetFilters}
                  aria-label={isBn ? 'ফিল্টার রিসেট করুন' : 'Reset filters'}
                  className="btn-press px-3 py-2 rounded bg-[#1c1d21] hover:bg-[#24262b] border border-white/15 text-[11px] text-gray-300 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isBn ? 'রিসেট' : 'Reset'}</span>
                </button>
                <button
                  onClick={onSearch}
                  aria-label={isBn ? 'মডিউল অন্বেষণ করুন' : 'Explore modules'}
                  className="btn-press flex-1 sm:flex-initial px-4 py-2 rounded bg-[#12664F] hover:bg-[#0E513F] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow border border-[#10b981]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
                >
                  <span>{isBn ? 'মডিউল দেখুন' : 'Explore'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#10b981]" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
