'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, Building, Banknote, ArrowRight, RotateCcw } from 'lucide-react';
import { SupportedLocale } from './landing-types';

interface LandingHeroProps {
  locale: SupportedLocale;
  selectedLocation: string;
  selectedType: string;
  selectedBudget: string;
  onLocationChange: (val: string) => void;
  onTypeChange: (val: string) => void;
  onBudgetChange: (val: string) => void;
  onResetFilters: () => void;
  onSearch: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  locale,
  selectedLocation,
  selectedType,
  selectedBudget,
  onLocationChange,
  onTypeChange,
  onBudgetChange,
  onResetFilters,
  onSearch,
}) => {
  const isBn = locale === 'bn';

  return (
    <section id="hero" className="relative w-full">
      {/* Bright Sky & Contemporary Architecture Container */}
      <div className="relative w-full h-[560px] sm:h-[640px] lg:h-[720px] overflow-hidden bg-[#c8dff0]">
        {/* Background Luxury Contemporary Residence */}
        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
            alt="BariVara Architectural Property"
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
        <div className="absolute left-6 sm:left-12 lg:left-24 top-1/2 -translate-y-4 max-w-xs sm:max-w-sm bg-[#111214]/80 backdrop-blur-md border border-white/15 p-4 sm:p-5 rounded-lg shadow-2xl">
          <p className="text-xs sm:text-sm text-gray-100 font-medium leading-relaxed">
            {isBn
              ? 'কাগজের খাতা থেকে স্মার্ট ডিজিটাল খতিয়ানে বাড়ি ও ফ্ল্যাট ব্যবস্থাপনা। স্বয়ংক্রিয় মাসিক বিল, ১-ক্লিকে হোয়াটসঅ্যাপ রসিদ ও নিশ্চিত ভাড়া আদায়।'
              : 'Discover modern rental living spaces crafted for timeless comfort, architectural clarity, and automated tenancy management.'}
          </p>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-300">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#d9ff43] animate-pulse" />
              {isBn ? '১৫,০০০+ নিবন্ধিত ইউনিট' : '15,000+ Managed Units'}
            </span>
            <a href="#properties" className="text-[#d9ff43] font-semibold hover:underline flex items-center gap-1">
              <span>{isBn ? 'প্রপার্টি দেখুন' : 'Explore'}</span>
              <span>↓</span>
            </a>
          </div>
        </div>

        {/* Bottom Filter Bar Overlapping Hero Footer */}
        <div className="absolute bottom-0 inset-x-0 bg-[#16171a]/95 backdrop-blur-md border-t border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              
              {/* Filter 1: Location */}
              <div className="lg:col-span-3 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-white/10 pb-2 sm:pb-0 sm:pr-4">
                <div>
                  <label htmlFor="filter-location" className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#d9ff43] font-semibold cursor-pointer">
                    <MapPin className="w-3 h-3 text-[#d9ff43]" />
                    <span>{isBn ? 'লোকেশন' : 'Location'}</span>
                  </label>
                  <select
                    id="filter-location"
                    aria-label={isBn ? 'লোকেশন নির্বাচন করুন' : 'Select Location'}
                    value={selectedLocation}
                    onChange={(e) => onLocationChange(e.target.value)}
                    className="bg-transparent text-white text-xs font-medium focus:outline-none mt-0.5 cursor-pointer pr-2"
                  >
                    <option value="all" className="bg-[#1c1d21] text-white">
                      {isBn ? 'সকল এলাকা (ঢাকা)' : 'All Locations (Dhaka)'}
                    </option>
                    <option value="Gulshan-2" className="bg-[#1c1d21] text-white">
                      {isBn ? 'গুলশান-২' : 'Gulshan-2, Dhaka'}
                    </option>
                    <option value="Banani" className="bg-[#1c1d21] text-white">
                      {isBn ? 'বনানী' : 'Banani, Dhaka'}
                    </option>
                    <option value="Dhanmondi" className="bg-[#1c1d21] text-white">
                      {isBn ? 'ধানমন্ডি' : 'Dhanmondi, Dhaka'}
                    </option>
                    <option value="Uttara" className="bg-[#1c1d21] text-white">
                      {isBn ? 'উত্তরা' : 'Uttara, Dhaka'}
                    </option>
                    <option value="Bashundhara" className="bg-[#1c1d21] text-white">
                      {isBn ? 'বসুন্ধরা আ/এ' : 'Bashundhara R/A'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Filter 2: Property Type */}
              <div className="lg:col-span-3 flex items-center justify-between border-b sm:border-b-0 lg:border-r border-white/10 pb-2 sm:pb-0 sm:pr-4">
                <div>
                  <label htmlFor="filter-property-type" className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#d9ff43] font-semibold cursor-pointer">
                    <Building className="w-3 h-3 text-[#d9ff43]" />
                    <span>{isBn ? 'প্রপার্টির ধরন' : 'Property Type'}</span>
                  </label>
                  <select
                    id="filter-property-type"
                    aria-label={isBn ? 'প্রপার্টির ধরন নির্বাচন করুন' : 'Select Property Type'}
                    value={selectedType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    className="bg-transparent text-white text-xs font-medium focus:outline-none mt-0.5 cursor-pointer pr-2"
                  >
                    <option value="all" className="bg-[#1c1d21] text-white">
                      {isBn ? 'সকল প্রপার্টি' : 'All Residences'}
                    </option>
                    <option value="Flat" className="bg-[#1c1d21] text-white">
                      {isBn ? 'রেসিডেন্সিয়াল ফ্ল্যাট' : 'Residential Flat'}
                    </option>
                    <option value="Duplex" className="bg-[#1c1d21] text-white">
                      {isBn ? 'ডুপ্লেক্স ভিলা' : 'Architectural Duplex'}
                    </option>
                    <option value="Penthouse" className="bg-[#1c1d21] text-white">
                      {isBn ? 'লাক্সারি পেন্টহাউস' : 'Luxury Penthouse'}
                    </option>
                    <option value="Studio" className="bg-[#1c1d21] text-white">
                      {isBn ? 'এক্সিকিউটিভ স্যুট' : 'Executive Suite'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Filter 3: Budget Range */}
              <div className="lg:col-span-3 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-white/10 pb-2 sm:pb-0 sm:pr-4">
                <div>
                  <label htmlFor="filter-budget" className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#d9ff43] font-semibold cursor-pointer">
                    <Banknote className="w-3 h-3 text-[#d9ff43]" />
                    <span>{isBn ? 'ভাড়ার বাজেট' : 'Monthly Budget'}</span>
                  </label>
                  <select
                    id="filter-budget"
                    aria-label={isBn ? 'ভাড়ার বাজেট নির্বাচন করুন' : 'Select Budget'}
                    value={selectedBudget}
                    onChange={(e) => onBudgetChange(e.target.value)}
                    className="bg-transparent text-white text-xs font-medium focus:outline-none mt-0.5 cursor-pointer pr-2 tabular-nums"
                  >
                    <option value="all" className="bg-[#1c1d21] text-white">
                      {isBn ? '৳৫০,০০০ – ৳২,৫০,০০০+' : '৳50,000 – ৳2,50,000+'}
                    </option>
                    <option value="under100k" className="bg-[#1c1d21] text-white">
                      {isBn ? '৳১,০০,০০০ এর নিচে' : 'Under ৳1,00,000'}
                    </option>
                    <option value="over100k" className="bg-[#1c1d21] text-white">
                      {isBn ? '৳১,০০,০০০ বা তদূর্ধ্ব' : '৳1,00,000 & Above'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Filter 4: Actions */}
              <div className="lg:col-span-3 flex items-center justify-end gap-2">
                <button
                  onClick={onResetFilters}
                  className="btn-press px-3 py-2 rounded bg-[#1c1d21] hover:bg-[#24262b] border border-white/15 text-[11px] text-gray-300 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isBn ? 'রিসেট' : 'Reset'}</span>
                </button>
                <button
                  onClick={onSearch}
                  className="btn-press flex-1 sm:flex-initial px-4 py-2 rounded bg-[#d9ff43] hover:bg-[#c6f028] text-[#111214] font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <span>{isBn ? 'অনুসন্ধান' : 'Search'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
