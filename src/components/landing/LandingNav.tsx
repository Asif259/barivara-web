'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Bookmark, ArrowUpRight, Globe } from 'lucide-react';
import { SupportedLocale } from './landing-types';

interface LandingNavProps {
  locale: SupportedLocale;
  onToggleLocale: () => void;
  savedCount: number;
  onOpenSavedToast: () => void;
  onOpenConsultation: () => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({
  locale,
  onToggleLocale,
  savedCount,
  onOpenSavedToast,
  onOpenConsultation,
}) => {
  const isBn = locale === 'bn';

  return (
    <>
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#16171a]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="#hero" className="flex items-center gap-2.5 group">
            {/* Geometric Pixel Lime Building Logo */}
            <svg
              className="w-6 h-6 text-[#d9ff43] transition-transform duration-200 group-hover:scale-105"
              viewBox="0 0 28 24"
              fill="currentColor"
            >
              <rect x="0" y="0" width="6" height="6" />
              <rect x="22" y="0" width="6" height="6" />
              <rect x="7" y="4" width="6" height="8" />
              <rect x="15" y="4" width="6" height="8" />
              <rect x="11" y="13" width="6" height="11" />
            </svg>
            <span className="font-extrabold tracking-[0.18em] text-sm sm:text-base text-white">
              {isBn ? 'BARIVARA' : 'BARIVARA'}
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-xs font-medium text-gray-300">
            <a href="#hero" className="text-[#d9ff43] font-semibold transition-colors duration-150">
              {isBn ? 'হোম' : 'Home'}
            </a>
            <a href="#process" className="hover:text-[#d9ff43] transition-colors duration-150">
              {isBn ? 'পদ্ধতি' : 'About Us'}
            </a>
            <a href="#properties" className="hover:text-[#d9ff43] transition-colors duration-150">
              {isBn ? 'প্রপার্টি' : 'Property'}
            </a>
            <a href="#testimonials" className="hover:text-[#d9ff43] transition-colors duration-150">
              {isBn ? 'অভিজ্ঞতা' : 'Landlords'}
            </a>
            <a href="#blog" className="hover:text-[#d9ff43] transition-colors duration-150">
              {isBn ? 'ব্লগ ও গাইড' : 'Blog'}
            </a>
            <a href="#cta" className="hover:text-[#d9ff43] transition-colors duration-150">
              {isBn ? 'যোগাযোগ' : 'Contact'}
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Bilingual Toggle */}
            <button
              onClick={onToggleLocale}
              aria-label="Switch Language"
              className="btn-press flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1c1d21] hover:bg-[#24262b] border border-white/15 text-[11px] font-medium text-gray-200"
            >
              <Globe className="w-3.5 h-3.5 text-[#d9ff43]" />
              <span className="font-semibold uppercase tracking-wider">{isBn ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Saved Shortlist Pill */}
            <button
              onClick={onOpenSavedToast}
              aria-label="View Saved Properties"
              className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1c1d21] hover:bg-[#24262b] border border-white/15 text-[11px] font-medium text-gray-200"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#d9ff43]" />
              <span>
                {isBn ? 'সংরক্ষিত' : 'Saved'} (<span className="text-[#d9ff43] font-bold tabular-nums">{savedCount}</span>)
              </span>
            </button>

            {/* Auth Link / Login */}
            <Link
              href="/login"
              className="hidden lg:inline-flex btn-press px-3 py-1.5 rounded bg-transparent hover:bg-white/5 border border-white/15 text-gray-300 font-semibold text-[11px]"
            >
              {isBn ? 'লগ ইন' : 'Sign In'}
            </Link>

            {/* Primary Action Button */}
            <button
              onClick={onOpenConsultation}
              className="btn-press px-3.5 py-1.5 rounded bg-[#d9ff43] hover:bg-[#c6f028] text-[#111214] font-bold text-[11px] flex items-center gap-1.5 shadow-sm"
            >
              <span>{isBn ? 'যোগাযোগ করুন' : 'Get in Touch'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

