'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, PhoneCall } from 'lucide-react';
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
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#d9ff43] font-bold">
            <span>• {isBn ? 'সহজ ও নিরাপদ ভাড়া ব্যবস্থাপনা' : 'Smart Tenancy Management'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            {isBn ? (
              <>আজই শুরু করুন আপনার বাড়ির<br />স্মার্ট ডিজিটাল খতিয়ান</>
            ) : (
              <>Ready to simplify and scale<br />your rental management?</>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed">
            {isBn
              ? 'কাগজের খাতার অনিশ্চয়তা ভুলে যোগ দিন বাংলাদেশের হাজারো বাড়িওয়ালার সাথে। ১-ক্লিকে রসিদ পাঠান, বকেয়া হিসাব রাখুন আর নিশ্চিন্তে ভাড়া সংগ্রহ করুন।'
              : 'Join thousands of residential and commercial property owners across Bangladesh. Automate monthly invoicing, send instant WhatsApp receipts, and secure peace of mind.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="btn-press px-5 py-2.5 rounded-sm bg-[#d9ff43] hover:bg-[#c6f028] text-[#111214] font-bold text-xs flex items-center gap-2 shadow-lg"
            >
              <span>{isBn ? 'বিনামূল্যে শুরু করুন' : 'Get Started Free'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={onOpenConsultation}
              className="btn-press px-5 py-2.5 rounded-sm bg-[#16171a]/90 hover:bg-[#24262b] text-white border border-white/20 font-semibold text-xs flex items-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#d9ff43]" />
              <span>{isBn ? 'পরামর্শ ও ডেমো' : 'Request Consultation'}</span>
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
            <div className="relative z-10 w-24 h-24 rounded-full bg-[#111214]/85 backdrop-blur border border-[#d9ff43]/40 flex items-center justify-center shadow-lg">
              <svg className="w-9 h-8 text-[#d9ff43]" viewBox="0 0 28 24" fill="currentColor">
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

