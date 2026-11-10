'use client';

import React from 'react';
import { SupportedLocale } from './landing-types';

interface LandingDividerProps {
  locale: SupportedLocale;
}

export const LandingDivider: React.FC<LandingDividerProps> = ({ locale }) => {
  const isBn = locale === 'bn';

  return (
    <div className="relative w-full border-y border-white/10 bg-[#1a1c20] py-3.5 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[10px] tracking-[0.22em] uppercase text-gray-400 font-semibold">
        <span className="hidden sm:inline">{isBn ? 'আর্কিটেকচার' : 'Architecture'}</span>
        <span>{isBn ? 'স্মার্ট ভাড়া' : 'Digital Khata'}</span>
        <span className="hidden md:inline">{isBn ? 'লাক্সারি ফ্ল্যাট' : 'Modern Living'}</span>

        {/* Center Neon Lime Geometric Badge with Dark Icon */}
        <div
          className="relative mx-4 px-8 py-2 bg-[#d9ff43] text-[#111214] rounded-sm shadow-lg flex items-center justify-center"
          style={{ clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)' }}
        >
          <svg className="w-6 h-5 text-[#111214]" viewBox="0 0 28 24" fill="currentColor">
            <rect x="0" y="0" width="6" height="6" />
            <rect x="22" y="0" width="6" height="6" />
            <rect x="7" y="4" width="6" height="8" />
            <rect x="15" y="4" width="6" height="8" />
            <rect x="11" y="13" width="6" height="11" />
          </svg>
        </div>

        <span className="hidden md:inline">{isBn ? 'হোয়াটসঅ্যাপ রসিদ' : 'WhatsApp Receipts'}</span>
        <span>{isBn ? 'স্বচ্ছ খতিয়ান' : 'Transparent'}</span>
        <span className="hidden sm:inline">{isBn ? 'আইনি চুক্তিপত্র' : 'Legal Security'}</span>
      </div>
    </div>
  );
};

