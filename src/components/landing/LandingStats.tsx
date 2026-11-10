'use client';

import React from 'react';
import { STATS } from './landing-data';
import { SupportedLocale } from './landing-types';

interface LandingStatsProps {
  locale: SupportedLocale;
}

export const LandingStats: React.FC<LandingStatsProps> = ({ locale }) => {
  const isBn = locale === 'bn';

  return (
    <section className="py-8 sm:py-12 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:flex md:items-center md:justify-center gap-4 md:gap-0">
        {STATS.map((stat, idx) => (
          <div
            key={idx}
            className="stat-circle w-full aspect-square max-w-[260px] mx-auto md:mx-0 rounded-full bg-[#1c1d21]/90 border border-white/10 flex flex-col items-center justify-center text-center p-6 hover:border-[#d9ff43]/60 transition-colors duration-300 shadow-xl"
          >
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight tabular-nums">
              {isBn ? stat.valueBn : stat.value}
            </span>
            <span className="text-[11px] text-gray-400 mt-2 uppercase tracking-wider font-medium max-w-[170px] leading-snug">
              {isBn ? stat.labelBn : stat.labelEn}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

