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
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[11px] text-gray-300 font-medium">
        <span className="hidden sm:inline">{isBn ? 'বাড়ি ও ফ্ল্যাট' : 'Properties & Units'}</span>
        <span>{isBn ? 'ভাড়াটিয়া এনআইডি' : 'Tenant Profiles'}</span>
        <span className="hidden md:inline">{isBn ? 'স্বয়ংক্রিয় মাসিক বিল' : 'Auto Invoicing'}</span>

        {/* Center Architectural Emerald Geometric Badge with Luminous Icon */}
        <div
          className="relative mx-4 px-8 py-2 bg-[#12664F] text-[#10b981] border border-[#10b981]/40 rounded-sm shadow-lg flex items-center justify-center"
          style={{ clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)' }}
        >
          <svg className="w-6 h-5 text-[#10b981]" viewBox="0 0 28 24" fill="currentColor" aria-hidden="true">
            <rect x="0" y="0" width="6" height="6" />
            <rect x="22" y="0" width="6" height="6" />
            <rect x="7" y="4" width="6" height="8" />
            <rect x="15" y="4" width="6" height="8" />
            <rect x="11" y="13" width="6" height="11" />
          </svg>
        </div>

        <span className="hidden md:inline">{isBn ? 'হোয়াটসঅ্যাপ রসিদ' : 'WhatsApp Receipts'}</span>
        <span>{isBn ? 'বিকাশ ও নগদ TrxID' : 'bKash TrxID'}</span>
        <span className="hidden sm:inline">{isBn ? 'আয়কর সিএসভি রিপোর্ট' : 'Tax CSV Ledgers'}</span>
      </div>
    </div>
  );
};
