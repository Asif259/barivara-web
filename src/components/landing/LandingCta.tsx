'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, PhoneCall, ShieldCheck } from 'lucide-react';
import { SupportedLocale } from './landing-types';

interface LandingCtaProps {
  locale: SupportedLocale;
  onOpenConsultation: () => void;
}

export const LandingCta: React.FC<LandingCtaProps> = ({ locale, onOpenConsultation }) => {
  const isBn = locale === 'bn';

  return (
    <section id="cta" className="relative overflow-hidden border-y border-white/10 louver-graphic">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-14 py-16 sm:py-24 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Action Content */}
        <div className="md:col-span-7 space-y-4">
          <p className="text-xs text-[#10b981] font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" aria-hidden="true" />
            <span>{isBn ? 'কাগজহীন স্মার্ট বাড়ি ব্যবস্থাপনা' : 'Digital Landlord Software'}</span>
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            {isBn ? (
              <>কাগজের খাতার অনিশ্চয়তা ভুলে<br />আজই শুরু করুন বাড়িভাড়া</>
            ) : (
              <>Ready to eliminate manual ledger chaos<br />and delayed rent collections?</>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed">
            {isBn
              ? '১ থেকে ১৫টি ফ্ল্যাট বা দোকান পরিচালনাকারী বাংলাদেশি বাড়িওয়ালাদের জন্য তৈরি। ১লা তারিখে অটোমেটিক বিল তৈরি করুন, বিকাশে ভাড়া নিয়ে ১-ক্লিকে হোয়াটসঅ্যাপে রসিদ পাঠিয়ে দিন।'
              : 'Built specifically for individual landlords managing 1–15 units in Dhaka and across Bangladesh. Generate automated bills, log bKash/Nagad payments, and dispatch instant WhatsApp receipts.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="btn-press px-5 py-2.5 rounded-sm bg-[#12664F] hover:bg-[#0E513F] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#12664F]/30 border border-[#10b981]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
            >
              <span>{isBn ? 'বিনামূল্যে শুরু করুন' : 'Get Started Free'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#10b981]" />
            </Link>
            <button
              onClick={onOpenConsultation}
              className="btn-press px-5 py-2.5 rounded-sm bg-[#16171a]/90 hover:bg-[#24262b] text-white border border-white/20 font-semibold text-xs flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#10b981]" />
              <span>{isBn ? 'পরামর্শ ও সাপোর্ট' : 'Request Landlord Demo'}</span>
            </button>
          </div>
        </div>

        {/* Decorative Sculptural Louver Sphere Visual (Matching Screenshot Right Graphic) */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-white/15 bg-gradient-to-tr from-[#111214] via-[#24262b] to-white/20 shadow-2xl overflow-hidden flex items-center justify-center">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  'repeating-linear-gradient(-38deg, #111214 0px, #111214 7px, #3b3e45 7px, #ffffff33 11px)',
              }}
            />
            <div className="relative z-10 w-24 h-24 rounded-full bg-[#111214]/85 backdrop-blur border border-[#10b981]/40 flex items-center justify-center shadow-lg">
              <svg className="w-9 h-8 text-[#10b981]" viewBox="0 0 28 24" fill="currentColor" aria-hidden="true">
                <rect x="0" y="0" width="6" height="6" />
                <rect x="22" y="0" width="6" height="6" />
                <rect x="7" y="4" width="6" height="8" />
                <rect x="15" y="4" width="6" height="8" />
                <rect x="11" y="13" width="6" height="11" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
