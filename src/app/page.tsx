'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguageStore, useLanguageHydrated, Language } from '@/stores/language-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  Building2,
  Users,
  Receipt,
  CreditCard,
  TrendingUp,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  FileText,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Globe,
  Home,
  Layers,
  Sparkles,
  PieChart,
  CalendarCheck
} from 'lucide-react';

export default function LandingPage() {
  const { language, setLanguage } = useLanguageStore();
  const languageHydrated = useLanguageHydrated();
  const { isAuthenticated } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'rents' | 'units'>('overview');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const isBn = languageHydrated ? language === 'bn' : false;

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  // Mock data for the interactive 6-month collection chart
  const monthsData = [
    { name: isBn ? 'জুন' : 'Jun', collected: 165000, outstanding: 15000, collectedPct: 62, outstandingPct: 14 },
    { name: isBn ? 'জুলাই' : 'Jul', collected: 172000, outstanding: 9000, collectedPct: 70, outstandingPct: 9 },
    { name: isBn ? 'আগস্ট' : 'Aug', collected: 168000, outstanding: 16000, collectedPct: 66, outstandingPct: 16 },
    { name: isBn ? 'সেপ্টেম্বর' : 'Sep', collected: 180000, outstanding: 8000, collectedPct: 78, outstandingPct: 8 },
    { name: isBn ? 'অক্টোবর' : 'Oct', collected: 176000, outstanding: 12000, collectedPct: 74, outstandingPct: 12 },
    { name: isBn ? 'নভেম্বর' : 'Nov', collected: 184000, outstanding: 36000, collectedPct: 84, outstandingPct: 18 },
  ];

  const formatBDT = (val: number) => {
    return '৳' + val.toLocaleString('en-IN');
  };

  return (
    <div className="min-h-screen bg-[#060807] text-[#F2F5F4] font-sans selection:bg-[#12664F] selection:text-white relative overflow-x-hidden">
      {/* Aurora Ambient Glow Effect */}
      <div
        className="pointer-events-none absolute -top-40 -right-28 w-[760px] h-[760px] rounded-full landing-aurora-glow opacity-80 blur-[80px] z-0"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-[1400px] -left-36 w-[620px] h-[620px] rounded-full bg-radial from-[#12664F]/35 via-[#307473]/15 to-transparent blur-[100px] z-0"
        aria-hidden="true"
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#060807]/85 backdrop-blur-md border-b border-white/[0.07]">
        <div className="max-w-[1160px] mx-auto px-5 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="#top" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-white/5 p-1 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Barivara Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tracking-tight text-[#F2F5F4]">Barivara</span>
              <span className="text-xs font-medium text-[#2DC2BD] font-bengali">বাড়িভাড়া</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm text-[#9AA5A1]" aria-label="Main Navigation">
            <Link href="#features" className="hover:text-[#F2F5F4] transition-colors">
              {isBn ? 'ফিচারসমূহ' : 'Features'}
            </Link>
            <Link href="#dashboard-preview" className="hover:text-[#F2F5F4] transition-colors">
              {isBn ? 'ড্যাশবোর্ড প্রিভিউ' : 'Dashboard'}
            </Link>
            <Link href="#how-it-works" className="hover:text-[#F2F5F4] transition-colors">
              {isBn ? 'কীভাবে কাজ করে' : 'How It Works'}
            </Link>
            <Link href="#why-barivara" className="hover:text-[#F2F5F4] transition-colors">
              {isBn ? 'কেন বাড়িভাড়া' : 'Why Barivara'}
            </Link>
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#9AA5A1] hover:text-[#F2F5F4] border border-white/10 hover:border-white/20 bg-white/[0.03] transition-all cursor-pointer"
              title={isBn ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Globe className="w-3.5 h-3.5 text-[#2DC2BD]" />
              <span>{isBn ? 'EN' : 'বাংলা'}</span>
            </button>

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] shadow-[0_4px_20px_-4px_rgba(18,102,79,0.7)] hover:shadow-[0_6px_24px_-4px_rgba(18,102,79,0.9)] hover:-translate-y-0.5 transition-all"
              >
                <span>{isBn ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Go to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[#9AA5A1] hover:text-[#F2F5F4] transition-colors"
                >
                  {isBn ? 'লগইন' : 'Sign In'}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] shadow-[0_4px_20px_-4px_rgba(18,102,79,0.7)] hover:shadow-[0_6px_24px_-4px_rgba(18,102,79,0.9)] hover:-translate-y-0.5 transition-all"
                >
                  <span>{isBn ? 'শুরু করুন' : 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              type="button"
              className="p-2 rounded-lg text-xs font-medium text-[#9AA5A1] border border-white/10 bg-white/[0.03]"
            >
              {isBn ? 'EN' : 'বাং'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#F2F5F4] border border-white/10 bg-white/[0.03]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/[0.07] bg-[#060807]/98 px-5 py-4 space-y-3">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#9AA5A1] hover:text-[#F2F5F4] py-1"
            >
              {isBn ? 'ফিচারসমূহ' : 'Features'}
            </Link>
            <Link
              href="#dashboard-preview"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#9AA5A1] hover:text-[#F2F5F4] py-1"
            >
              {isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#9AA5A1] hover:text-[#F2F5F4] py-1"
            >
              {isBn ? 'কীভাবে কাজ করে' : 'How It Works'}
            </Link>
            <Link
              href="#why-barivara"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#9AA5A1] hover:text-[#F2F5F4] py-1"
            >
              {isBn ? 'কেন বাড়িভাড়া' : 'Why Barivara'}
            </Link>
            <div className="pt-3 border-t border-white/[0.07] flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c]"
                >
                  {isBn ? 'ড্যাশবোর্ডে যান' : 'Go to Dashboard'}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-medium text-[#9AA5A1] hover:text-[#F2F5F4]"
                  >
                    {isBn ? 'লগইন' : 'Sign In'}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c]"
                  >
                    {isBn ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন' : 'Get Started Free'}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main id="top" className="relative z-10">
        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden pt-16 md:pt-24 pb-16 md:pb-24">
          {/* Subtle Repeating Grid Backdrop */}
          <div className="pointer-events-none absolute inset-0 landing-grid-pattern z-0" aria-hidden="true" />

          {/* Subtle bottom gradient mask */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent to-[#060807] z-0"
            aria-hidden="true"
          />

          <div className="max-w-[1160px] mx-auto px-5 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Headline and Actions */}
              <div className="lg:col-span-7 space-y-6">
                {/* Eyebrow Pill */}
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider text-[#2DC2BD] border border-[#2DC2BD]/30 bg-[#12664F]/20 rounded-full px-3.5 py-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#2DC2BD]" />
                  <span>
                    {isBn
                      ? 'বাংলাদেশের আধুনিক বাড়ি ও ভাড়া ব্যবস্থাপনা প্ল্যাটফর্ম'
                      : "BANGLADESH'S SMART RENTAL PLATFORM"}
                  </span>
                </div>

                {/* Primary Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#F2F5F4] leading-[1.1] md:leading-[1.08]">
                  {isBn ? (
                    <>
                      আপনার বাড়ি। আপনার ভাড়া। <br />
                      <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#2DC2BD] via-[#C6D4FF] to-white">
                        সম্পূর্ণ নিয়ন্ত্রণে।
                      </span>
                    </>
                  ) : (
                    <>
                      Your Properties. Your Rent. <br />
                      <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#2DC2BD] via-[#C6D4FF] to-white">
                        Under Complete Control.
                      </span>
                    </>
                  )}
                </h1>

                {/* Subtitle / Lead Paragraph */}
                <p className="text-base sm:text-lg text-[#9AA5A1] max-w-xl font-normal leading-relaxed">
                  {isBn
                    ? 'একাধিক বাড়ি ও ফ্ল্যাট, ভাড়া চুক্তি, ইউটিলিটি বিলসহ মাসিক ভাড়া নোটিশ, বিকাশ ও নগদ আদায় এবং তাৎক্ষণিক মানি রিসিট—সবকিছু এক প্ল্যাটফর্মে ম্যানেজ করুন।'
                    : 'Manage properties, flats, tenants, monthly rent notices, bKash & cash collections, and instant digital payment receipts from one unified, stress-free dashboard.'}
                </p>

                {/* Action CTAs */}
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <Link
                    href={isAuthenticated ? '/dashboard' : '/register'}
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] shadow-[0_8px_30px_-6px_rgba(18,102,79,0.9)] hover:shadow-[0_10px_35px_-6px_rgba(18,102,79,1)] hover:-translate-y-0.5 transition-all"
                  >
                    <span>
                      {isAuthenticated
                        ? isBn
                          ? 'ড্যাশবোর্ডে যান'
                          : 'Go to Dashboard'
                        : isBn
                        ? 'বিনামূল্যে শুরু করুন'
                        : 'Get Started Free'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="#features"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-[#F2F5F4] border border-white/20 hover:border-white/40 bg-white/[0.03] hover:bg-white/[0.07] transition-all hover:-translate-y-0.5"
                  >
                    <span>{isBn ? 'ফিচারসমূহ দেখুন' : 'Explore Features'}</span>
                  </Link>
                </div>

                {/* Trust Metrics Pill */}
                <div className="pt-4 flex items-center gap-6 text-xs text-[#9AA5A1]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2DC2BD]" />
                    <span>{isBn ? 'বাংলা ও ইংরেজি সাপোর্ট' : 'Bangla & English'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2DC2BD]" />
                    <span>{isBn ? 'বিকাশ ও নগদ হিসাব' : 'bKash, Nagad & Cash'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2DC2BD]" />
                    <span>{isBn ? 'প্রিন্টযোগ্য মানি রিসিট' : 'Printable Receipts'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Architectural Stage & Floating Cards */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-square w-full max-w-[500px] mx-auto flex items-center justify-center">
                  {/* Architectural Graphic Backdrop */}
                  <svg
                    className="absolute inset-[6%_10%_0] w-[80%] h-[92%] opacity-90 transition-opacity"
                    viewBox="0 0 300 380"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="heroBldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#2DC2BD" stopOpacity="0.25" />
                        <stop offset="1" stopColor="#12664F" stopOpacity="0.03" />
                      </linearGradient>
                      <linearGradient id="heroLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#2DC2BD" stopOpacity="0.6" />
                        <stop offset="1" stopColor="#12664F" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    {/* Tower 1 */}
                    <path
                      d="M40 380V120l90-40v60l70-30v270z"
                      fill="url(#heroBldGrad)"
                      stroke="rgba(45,194,189,0.35)"
                      strokeWidth="1.2"
                    />
                    {/* Tower 2 */}
                    <path
                      d="M200 380V110l60 24v246z"
                      fill="url(#heroBldGrad)"
                      stroke="rgba(45,194,189,0.25)"
                      strokeWidth="1.2"
                    />
                    {/* Architectural Windows with soft cyan glow */}
                    <g fill="#2DC2BD" opacity="0.65">
                      <rect x="62" y="150" width="14" height="10" rx="1.5" />
                      <rect x="90" y="150" width="14" height="10" rx="1.5" />
                      <rect x="118" y="150" width="14" height="10" rx="1.5" />
                      <rect x="62" y="190" width="14" height="10" rx="1.5" />
                      <rect x="118" y="190" width="14" height="10" rx="1.5" />
                      <rect x="90" y="230" width="14" height="10" rx="1.5" />
                      <rect x="62" y="270" width="14" height="10" rx="1.5" />
                      <rect x="146" y="200" width="14" height="10" rx="1.5" />
                      <rect x="215" y="170" width="12" height="9" rx="1.5" />
                      <rect x="238" y="210" width="12" height="9" rx="1.5" />
                      <rect x="215" y="250" width="12" height="9" rx="1.5" />
                    </g>
                  </svg>

                  {/* Floating Card 1: Monthly Rent (Top Left) */}
                  <div
                    className="landing-float-1 absolute top-[4%] left-[2%] w-[58%] border border-white/15 rounded-2xl p-4.5 bg-[#12664F]/50 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] text-left"
                    role="region"
                    aria-label="Unit Monthly Rent sample card"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <small className="text-[#B4BEBA] text-xs font-normal">
                        {isBn ? 'মাসিক ভাড়া · ফ্ল্যাট ৪বি' : 'Monthly Rent · Unit 4B'}
                      </small>
                      <span className="w-2 h-2 rounded-full bg-[#2DC2BD] animate-pulse" />
                    </div>
                    <b className="block text-2xl font-light text-[#F2F5F4] tracking-tight">৳25,000</b>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-block text-[10px] font-medium text-[#2DC2BD] bg-[#2DC2BD]/15 border border-[#2DC2BD]/25 rounded-full px-2.5 py-0.5">
                        {isBn ? 'ভাড়া হয়েছে · ৫ তারিখ দেয়' : 'Occupied · Due 5th Nov'}
                      </span>
                    </div>
                  </div>

                  {/* Floating Card 2: Payment Status (Middle Right) */}
                  <div
                    className="landing-float-2 absolute top-[36%] right-0 w-[54%] border border-white/15 rounded-2xl p-4.5 bg-[#307473]/50 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] text-left"
                    role="region"
                    aria-label="Payment status sample card"
                  >
                    <small className="block text-[#B4BEBA] text-xs font-normal mb-1">
                      {isBn ? 'পেমেন্ট অবস্থা · বিকাশ' : 'Payment Status · bKash'}
                    </small>
                    <b className="block text-xl font-normal text-[#F2F5F4] tracking-tight">
                      {isBn ? 'আংশিক পরিশোধ' : 'Partial Paid'}
                    </b>
                    <div className="mt-2 text-[11px] text-[#2DC2BD] bg-[#2DC2BD]/15 border border-[#2DC2BD]/25 rounded-full px-2.5 py-0.5 inline-block">
                      {isBn ? '৳১৫,০০০ পরিশোধিত (বকেয়া ৳১০,০০০)' : '৳15,000 of ৳25,000 paid'}
                    </div>
                  </div>

                  {/* Floating Card 3: Monthly Collection (Bottom Left) */}
                  <div
                    className="landing-float-3 absolute bottom-[4%] left-[10%] w-[64%] border border-white/15 rounded-2xl p-4.5 bg-[#7A82AB]/30 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] text-left"
                    role="region"
                    aria-label="Monthly rental income sample card"
                  >
                    <small className="block text-[#B4BEBA] text-xs font-normal mb-1">
                      {isBn ? 'নভেম্বর ভাড়া আদায়' : 'Monthly Rental Income'}
                    </small>
                    <b className="block text-2xl font-light text-[#F2F5F4] tracking-tight">৳184,000</b>

                    {/* Sparkline mini-bars */}
                    <div className="flex items-end gap-1.5 h-8 mt-2.5" aria-hidden="true">
                      <div className="flex-1 bg-[#2DC2BD] opacity-80 rounded-t-[2px] h-[55%]" />
                      <div className="flex-1 bg-[#7A82AB] opacity-80 rounded-t-[2px] h-[70%]" />
                      <div className="flex-1 bg-[#2DC2BD] opacity-80 rounded-t-[2px] h-[62%]" />
                      <div className="flex-1 bg-[#7A82AB] opacity-80 rounded-t-[2px] h-[80%]" />
                      <div className="flex-1 bg-[#2DC2BD] opacity-80 rounded-t-[2px] h-[74%]" />
                      <div className="flex-1 bg-[#2DC2BD] opacity-95 rounded-t-[2px] h-[92%]" />
                    </div>
                    <div className="mt-2 text-[10px] text-[#C6D4FF] flex justify-between">
                      <span>{isBn ? 'আদায়ের হার' : 'Collection Rate'}</span>
                      <span className="font-semibold text-[#2DC2BD]">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE DASHBOARD PREVIEW SECTION                                    */}
        {/* ========================================================================= */}
        <section id="dashboard-preview" className="py-20 border-t border-white/[0.07] relative">
          <div className="max-w-[1160px] mx-auto px-5">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-[11px] font-semibold tracking-wider text-[#2DC2BD] border border-[#2DC2BD]/30 bg-[#12664F]/20 rounded-full px-3.5 py-1 mb-3">
                {isBn ? 'কমান্ড সেন্টার' : 'COMMAND CENTER'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#F2F5F4]">
                {isBn ? 'সব বাড়ির সম্পূর্ণ হিসাব এক ড্যাশবোর্ডে।' : 'One dashboard for every property.'}
              </h2>
              <p className="text-sm sm:text-base text-[#9AA5A1] mt-3">
                {isBn
                  ? 'বাড়ি ও ফ্ল্যাটের বর্তমান অবস্থা, চলতি মাসের ভাড়া আদায় ও বকেয়ার বিবরণী সহজে মনিটর করুন।'
                  : 'Real-time visibility over occupied units, monthly rent collections, utility costs, and overdue balances.'}
              </p>
            </div>

            {/* Dashboard Mock Shell */}
            <div className="border border-white/[0.08] rounded-3xl bg-[#080C0A] overflow-hidden shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] grid grid-cols-1 md:grid-cols-12">
              {/* Mock Sidebar */}
              <div className="hidden md:block md:col-span-3 border-r border-white/[0.07] p-5 space-y-1 bg-[#060907]">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#F2F5F4] mb-3">
                  <Building2 className="w-4 h-4 text-[#2DC2BD]" />
                  <span>BariVara Pro</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#12664F]/40 text-[#F2F5F4] font-medium border border-[#12664F]/50">
                    <Home className="w-3.5 h-3.5 text-[#2DC2BD]" />
                    <span>{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9AA5A1] hover:text-[#F2F5F4]">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isBn ? 'বাড়ি ও ফ্ল্যাট' : 'Properties & Units'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9AA5A1] hover:text-[#F2F5F4]">
                    <Users className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ভাড়াটিয়া' : 'Tenants'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9AA5A1] hover:text-[#F2F5F4]">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ভাড়া চুক্তি' : 'Agreements'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9AA5A1] hover:text-[#F2F5F4]">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>{isBn ? 'মাসিক ভাড়া ও বিল' : 'Monthly Rents'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9AA5A1] hover:text-[#F2F5F4]">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{isBn ? 'পেমেন্ট ও আদায়' : 'Payments'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9AA5A1] hover:text-[#F2F5F4]">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{isBn ? 'খরচাপাতি' : 'Expenses'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9AA5A1] hover:text-[#F2F5F4]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{isBn ? 'প্রতিবেদন' : 'Reports'}</span>
                  </div>
                </div>
              </div>

              {/* Mock Main Dashboard Body */}
              <div className="md:col-span-9 p-6 lg:p-8 space-y-6">
                {/* Header Tabs inside dashboard */}
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/[0.06] pb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className={`px-4 py-1.5 rounded-full border transition-all ${
                        activeTab === 'overview'
                          ? 'border-[#2DC2BD]/50 bg-[#12664F]/35 text-[#F2F5F4] font-medium'
                          : 'border-white/10 text-[#9AA5A1] hover:text-[#F2F5F4]'
                      }`}
                    >
                      {isBn ? 'সারসংক্ষেপ' : 'Overview'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('rents')}
                      className={`px-4 py-1.5 rounded-full border transition-all ${
                        activeTab === 'rents'
                          ? 'border-[#2DC2BD]/50 bg-[#12664F]/35 text-[#F2F5F4] font-medium'
                          : 'border-white/10 text-[#9AA5A1] hover:text-[#F2F5F4]'
                      }`}
                    >
                      {isBn ? 'ভাড়া আদায় বিশ্লেষণ' : 'Rent Analysis'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('units')}
                      className={`px-4 py-1.5 rounded-full border transition-all ${
                        activeTab === 'units'
                          ? 'border-[#2DC2BD]/50 bg-[#12664F]/35 text-[#F2F5F4] font-medium'
                          : 'border-white/10 text-[#9AA5A1] hover:text-[#F2F5F4]'
                      }`}
                    >
                      {isBn ? 'ফ্ল্যাট ও ভাড়াটিয়া' : 'Units & Tenants'}
                    </button>
                  </div>

                  <span className="text-xs text-[#2DC2BD] bg-[#2DC2BD]/10 border border-[#2DC2BD]/20 px-3 py-1 rounded-full">
                    {isBn ? 'চলতি মাস: নভেম্বর ২০২৬' : 'Current: November 2026'}
                  </span>
                </div>

                {/* Main Top Chart Box & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Monthly Collection Chart */}
                  <div className="lg:col-span-2 border border-white/[0.08] rounded-2xl p-5 bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <small className="text-xs text-[#9AA5A1] block">
                          {isBn ? 'চলতি মাসে আদায়কৃত ভাড়া' : 'Rent Collected · Current Month'}
                        </small>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-3xl font-light tracking-tight text-[#F2F5F4]">৳184,000</span>
                          <span className="text-xs text-[#2DC2BD] font-medium">▲ +12% {isBn ? 'বৃদ্ধি' : 'vs avg'}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <small className="text-[#9AA5A1] block">{isBn ? 'বকেয়া' : 'Due'}</small>
                        <span className="text-sm font-medium text-[#C6D4FF]">৳36,000</span>
                      </div>
                    </div>

                    {/* Interactive Bar Chart */}
                    <div className="mt-6">
                      <div className="flex items-end gap-3 sm:gap-4 h-40 pt-4 pb-1">
                        {monthsData.map((m, idx) => (
                          <div
                            key={m.name}
                            className="flex-1 flex items-end gap-1 sm:gap-1.5 h-full group relative cursor-pointer"
                            onMouseEnter={() => setHoveredMonthIndex(idx)}
                            onMouseLeave={() => setHoveredMonthIndex(null)}
                          >
                            {/* Hover Tooltip */}
                            {hoveredMonthIndex === idx && (
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 bg-[#0A0F0D] border border-white/20 rounded-lg p-2 text-[10px] text-white shadow-xl whitespace-nowrap pointer-events-none">
                                <div className="font-semibold text-[#2DC2BD]">{m.name}</div>
                                <div>{isBn ? 'আদায়' : 'Paid'}: {formatBDT(m.collected)}</div>
                                <div className="text-[#C6D4FF]">{isBn ? 'বকেয়া' : 'Due'}: {formatBDT(m.outstanding)}</div>
                              </div>
                            )}

                            {/* Collected Bar */}
                            <div
                              className="flex-1 rounded-t-md bg-gradient-to-t from-[#12664F] to-[#2DC2BD] transition-all duration-300 group-hover:brightness-125"
                              style={{ height: `${m.collectedPct}%` }}
                            />
                            {/* Outstanding Bar */}
                            <div
                              className="flex-1 rounded-t-md bg-[#7A82AB]/70 transition-all duration-300 group-hover:brightness-125"
                              style={{ height: `${m.outstandingPct * 2}%` }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Month Labels & Legend */}
                      <div className="flex justify-between text-[11px] text-[#9AA5A1] border-t border-white/[0.06] pt-2">
                        {monthsData.map((m) => (
                          <span key={m.name} className="flex-1 text-center font-medium">
                            {m.name}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-[#9AA5A1]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#2DC2BD]" />
                          <span>{isBn ? 'সংগৃহীত ভাড়া' : 'Collected Rent'}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#7A82AB]" />
                          <span>{isBn ? 'বকেয়া' : 'Outstanding Balance'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Shortcuts */}
                  <div className="border border-white/[0.08] rounded-2xl p-5 bg-white/[0.02] flex flex-col justify-between">
                    <div>
                      <small className="text-xs text-[#9AA5A1] block mb-3">
                        {isBn ? 'দ্রুত অ্যাকশন' : 'Quick Actions'}
                      </small>
                      <div className="space-y-2.5">
                        <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex items-center justify-between text-xs text-[#F2F5F4] cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-[#2DC2BD]" />
                            <span>{isBn ? 'নতুন বাড়ি যুক্ত করুন' : 'Add Property'}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#9AA5A1]" />
                        </div>

                        <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex items-center justify-between text-xs text-[#F2F5F4] cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-[#2DC2BD]" />
                            <span>{isBn ? 'ভাড়াটিয়া ও চুক্তি যুক্ত' : 'Register Tenant'}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#9AA5A1]" />
                        </div>

                        <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex items-center justify-between text-xs text-[#F2F5F4] cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Receipt className="w-3.5 h-3.5 text-[#2DC2BD]" />
                            <span>{isBn ? 'পেমেন্ট ও মানি রিসিট' : 'Record Payment'}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#9AA5A1]" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.06] text-[11px] text-[#9AA5A1]">
                      <span>{isBn ? 'বিকাশ ও নগদে সংগৃহীত:' : 'bKash/Nagad collections:'} </span>
                      <span className="text-[#2DC2BD] font-medium">৳132,000</span>
                    </div>
                  </div>
                </div>

                {/* KPI Summary Tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border border-white/[0.08] rounded-2xl p-4 bg-white/[0.02]">
                    <small className="text-xs text-[#9AA5A1] block">{isBn ? 'মোট প্রপার্টি' : 'Properties'}</small>
                    <b className="block text-2xl font-light text-[#F2F5F4] mt-1">6</b>
                    <span className="text-[11px] text-[#9AA5A1] block mt-0.5">
                      {isBn ? '২৪টি ফ্ল্যাট / ইউনিট' : '24 Total Units'}
                    </span>
                  </div>

                  <div className="border border-white/[0.08] rounded-2xl p-4 bg-white/[0.02]">
                    <small className="text-xs text-[#9AA5A1] block">{isBn ? 'বর্তমান ভাড়াটিয়া' : 'Active Tenants'}</small>
                    <b className="block text-2xl font-light text-[#F2F5F4] mt-1">22</b>
                    <span className="text-[11px] text-[#2DC2BD] block mt-0.5">
                      {isBn ? '৯২% ফ্ল্যাট ভাড়া হয়েছে' : '92% Occupied'}
                    </span>
                  </div>

                  <div className="border border-white/[0.08] rounded-2xl p-4 bg-white/[0.02]">
                    <small className="text-xs text-[#9AA5A1] block">{isBn ? 'আদায়কৃত ভাড়া' : 'Rent Collected'}</small>
                    <b className="block text-2xl font-light text-[#2DC2BD] mt-1">৳184,000</b>
                    <span className="text-[11px] text-[#9AA5A1] block mt-0.5">
                      {isBn ? 'নভেম্বর ২০২৬' : 'November 2026'}
                    </span>
                  </div>

                  <div className="border border-white/[0.08] rounded-2xl p-4 bg-white/[0.02]">
                    <small className="text-xs text-[#9AA5A1] block">{isBn ? 'বকেয়া পাওনা' : 'Outstanding Balance'}</small>
                    <b className="block text-2xl font-light text-[#C6D4FF] mt-1">৳36,000</b>
                    <span className="text-[11px] text-[#9AA5A1] block mt-0.5">
                      {isBn ? '২টি ইউনিটের বকেয়া' : '2 Units Overdue'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-[#9AA5A1]/70 mt-4">
              {isBn
                ? 'ড্যাশবোর্ড ইন্টারফেসে দেখানো তথ্যাদি প্রদর্শনীর সুবিধার্থে সাজানো হয়েছে।'
                : 'Dashboard preview represents live platform structure with sample property figures.'}
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CORE FEATURES DEEP DIVE (ALTERNATING PANELS)                             */}
        {/* ========================================================================= */}
        <section id="features" className="py-20 border-t border-white/[0.07]">
          <div className="max-w-[1160px] mx-auto px-5 space-y-12">
            {/* Panel 1: Properties & Units */}
            <div className="bg-[#0A0F0D] border border-white/[0.08] rounded-3xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <span className="inline-block text-[11px] font-semibold tracking-wider text-[#2DC2BD] border border-[#2DC2BD]/30 bg-[#12664F]/20 rounded-full px-3.5 py-1">
                  {isBn ? 'বাড়ি ও ফ্ল্যাট ব্যবস্থাপনা' : 'PROPERTIES & UNITS'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#F2F5F4] leading-tight">
                  {isBn ? 'প্রতিটি বাড়ি ও ফ্ল্যাট, সুবিন্যস্ত এক নজরে।' : 'Every Property, Floor & Unit, Perfectly Organized.'}
                </h2>
                <p className="text-sm sm:text-base text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'মিরপুর, ধানমন্ডি বা গুলশান—যেখানেই বাড়ি থাকুক না কেন, সকল ফ্ল্যাট, শপ ও রুমের তথ্য খাতায় না লিখে ক্লাউডে গুছিয়ে রাখুন। খালি ও ভাড়া ফ্ল্যাটের সঠিক হিসাব থাকবে সবসময়।'
                    : 'Manage multi-story buildings, residential flats, commercial shops, and vacancy status across Dhaka and beyond. Replace handwritten diaries with cloud precision.'}
                </p>

                <ul className="space-y-3 pt-2 text-sm text-[#F2F5F4]">
                  <li className="flex items-start gap-3 landing-check-icon">
                    <span>
                      {isBn
                        ? 'রিয়েল-টাইম ভাড়া অবস্থা (ভাড়া হয়েছে, খালি আছে বা মেরামত চলছে)'
                        : 'Live occupancy tracking (Occupied, Available, Under Maintenance)'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3 landing-check-icon">
                    <span>
                      {isBn
                        ? 'ফ্ল্যাটের বিবরণ—বেডরুম, বাথরুম, ভাড়া এবং আলাদা মিটার নম্বর'
                        : 'Floor-by-floor unit specs: bedrooms, bathrooms, rent rates, and meter numbers'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3 landing-check-icon">
                    <span>
                      {isBn
                        ? 'ভাড়াটিয়া চুক্তিপত্র ও ইতিহাস সরাসরি ফ্ল্যাটের সাথে সংযুক্ত'
                        : 'Complete digital tenancy records with agreement start and expiry dates'}
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] hover:-translate-y-0.5 transition-all shadow-md"
                  >
                    <span>{isBn ? 'শুরু করুন' : 'Get Started'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Visual: Stacked Property Cards */}
              <div className="relative min-h-[300px] flex items-center justify-center">
                <div className="relative w-full max-w-[360px] h-[280px]">
                  {/* Card 1 */}
                  <div className="absolute top-0 left-0 w-[78%] border border-white/15 rounded-2xl p-4.5 bg-[#12664F]/50 backdrop-blur-md shadow-xl transition-transform hover:-translate-y-1 z-10">
                    <span className="text-xs text-[#B4BEBA] block">{isBn ? 'মিরপুর টাওয়ার · ফ্ল্যাট ২এ' : 'Mirpur Tower · Unit 2A'}</span>
                    <b className="block text-xl font-normal text-[#F2F5F4] mt-1">৳18,000 / {isBn ? 'মাস' : 'mo'}</b>
                    <div className="mt-2 text-[10px] text-[#2DC2BD] bg-[#2DC2BD]/15 border border-[#2DC2BD]/20 rounded-full px-2 py-0.5 inline-block">
                      {isBn ? 'ভাড়া হয়েছে · পরিবার' : 'Occupied · 3 Bed, 2 Bath'}
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="absolute top-[28%] left-[16%] w-[78%] border border-white/15 rounded-2xl p-4.5 bg-[#307473]/55 backdrop-blur-md shadow-2xl transition-transform hover:-translate-y-1 z-20">
                    <span className="text-xs text-[#B4BEBA] block">{isBn ? 'ধানমন্ডি লেকভিউ · ফ্ল্যাট ৪বি' : 'Dhanmondi Lakeview · Unit 4B'}</span>
                    <b className="block text-xl font-normal text-[#F2F5F4] mt-1">৳25,000 / {isBn ? 'মাস' : 'mo'}</b>
                    <div className="mt-2 text-[10px] text-[#2DC2BD] bg-[#2DC2BD]/15 border border-[#2DC2BD]/20 rounded-full px-2 py-0.5 inline-block">
                      {isBn ? 'ভাড়া হয়েছে · ৫ নভেম্বর দেয়' : 'Occupied · Due Nov 5th'}
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="absolute top-[56%] left-[30%] w-[78%] border border-white/15 rounded-2xl p-4.5 bg-[#7A82AB]/40 backdrop-blur-md shadow-2xl transition-transform hover:-translate-y-1 z-30">
                    <span className="text-xs text-[#B4BEBA] block">{isBn ? 'বনানী হাইটস · ফ্ল্যাট ৫সি' : 'Banani Heights · Unit 5C'}</span>
                    <b className="block text-xl font-normal text-[#F2F5F4] mt-1">৳32,000 / {isBn ? 'মাস' : 'mo'}</b>
                    <div className="mt-2 text-[10px] text-[#C6D4FF] bg-[#C6D4FF]/15 border border-[#C6D4FF]/20 rounded-full px-2 py-0.5 inline-block">
                      {isBn ? 'খালি আছে · রেডি টু রেন্ট' : 'Vacant · Ready to Rent'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 2: Monthly Rents & Utilities [Flipped Layout] */}
            <div className="bg-[#0A0F0D] border border-white/[0.08] rounded-3xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Visual: Grouped Chart */}
              <div className="order-2 lg:order-1">
                <div className="border border-white/[0.08] rounded-2xl p-6 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-4">
                    <small className="text-xs text-[#9AA5A1]">
                      {isBn ? 'সংগৃহীত বনাম বকেয়া ভাড়া (৬ মাস)' : 'Collected vs Outstanding Rent (6 Months)'}
                    </small>
                    <span className="text-xs text-[#2DC2BD] font-medium">
                      {isBn ? 'গড় আদায়: ৮৮%' : '88% Avg Collection'}
                    </span>
                  </div>

                  {/* Chart Bars */}
                  <div className="flex items-end gap-3 h-44 pt-4 pb-1">
                    {monthsData.map((m) => (
                      <div key={m.name} className="flex-1 flex items-end gap-1.5 h-full">
                        <div
                          className="flex-1 rounded-t bg-gradient-to-t from-[#12664F] to-[#2DC2BD]"
                          style={{ height: `${m.collectedPct}%` }}
                        />
                        <div
                          className="flex-1 rounded-t bg-[#7A82AB]/80"
                          style={{ height: `${m.outstandingPct * 2}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Month Labels */}
                  <div className="flex justify-between text-xs text-[#9AA5A1] border-t border-white/[0.07] pt-2">
                    {monthsData.map((m) => (
                      <span key={m.name} className="flex-1 text-center font-medium">
                        {m.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                    <span className="flex items-center gap-2 text-[#2DC2BD]">
                      <span className="w-3 h-3 rounded-sm bg-[#2DC2BD]" />
                      <span>{isBn ? 'আদায়কৃত' : 'Collected'}</span>
                    </span>
                    <span className="flex items-center gap-2 text-[#7A82AB]">
                      <span className="w-3 h-3 rounded-sm bg-[#7A82AB]" />
                      <span>{isBn ? 'বকেয়া' : 'Outstanding'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Information */}
              <div className="space-y-5 order-1 lg:order-2">
                <span className="inline-block text-[11px] font-semibold tracking-wider text-[#2DC2BD] border border-[#2DC2BD]/30 bg-[#12664F]/20 rounded-full px-3.5 py-1">
                  {isBn ? 'মাসিক ভাড়া ও ইউটিলিটি বিল' : 'RENT & UTILITY BILLING'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#F2F5F4] leading-tight">
                  {isBn
                    ? 'ইউটিলিটি বিলসহ মাসিক ভাড়ার নির্ভুল হিসাব।'
                    : "Know What's Paid. Know What's Pending."}
                </h2>
                <p className="text-sm sm:text-base text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'মূল ভাড়া, বিদ্যুৎ বিল (ডেসকো/ডিপিডিসি সাবমিটার), ওয়াসা পানি, গ্যাস, জেনারেটর এবং সার্ভিস চার্জ—প্রতিটি খাতের হিসাব পরিষ্কার থাকবে। মাসের শুরুতে ১-ক্লিকেই ভাড়া তৈরি করুন।'
                    : 'Eliminate calculation disputes. Generate monthly rent records with itemized utility splits for electricity, gas, water, parking, and building service charges.'}
                </p>

                <ul className="space-y-3 pt-2 text-sm text-[#F2F5F4]">
                  <li className="flex items-start gap-3 landing-check-icon">
                    <span>
                      {isBn
                        ? '১ ক্লিকে মাসের ভাড়া জেনারেট (১ম থেকে ১০ম তারিখের স্যালারি সাইকেল অনুসারে)'
                        : 'One-click monthly billing aligned with Bangladesh salary cycles (1st to 10th)'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3 landing-check-icon">
                    <span>
                      {isBn
                        ? 'আংশিক পেমেন্ট ও বকেয়ার স্বয়ংক্রিয় ট্র্যাকিং'
                        : 'Partial payments tracking with instant remaining balance calculation'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3 landing-check-icon">
                    <span>
                      {isBn
                        ? 'ভাড়াটিয়াকে সহজে প্রেরণের উপযোগী ডিজিটাল ভাড়া নোটিশ'
                        : 'Itemized rent notices delivered to tenants before the due date'}
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] hover:-translate-y-0.5 transition-all shadow-md"
                  >
                    <span>{isBn ? 'শুরু করুন' : 'Get Started'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Panel 3: Rent Notices & Digital Receipts */}
            <div className="bg-[#0A0F0D] border border-white/[0.08] rounded-3xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <span className="inline-block text-[11px] font-semibold tracking-wider text-[#2DC2BD] border border-[#2DC2BD]/30 bg-[#12664F]/20 rounded-full px-3.5 py-1">
                  {isBn ? 'ভাড়া নোটিশ ও ডিজিটাল রশিদ' : 'NOTICES AND RECEIPTS'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#F2F5F4] leading-tight">
                  {isBn ? 'স্বচ্ছ হিসাব। কোনো ভুল বোঝাবুঝি নেই।' : 'Clear Records. Zero Disputes. Instant Receipts.'}
                </h2>
                <p className="text-sm sm:text-base text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'ভাড়া পরিশোধের পূর্বে ভাড়াটিয়াকে দিন প্রাতিষ্ঠানিক "ভাড়া নোটিশ"। আর টাকা পাওয়ার সাথে সাথেই বিকাশ, নগদ বা ব্যাংকের জন্য দিন ডিজিটাল "মানি রিসিট", যা হোয়াটসঅ্যাপ বা প্রিন্টে দেওয়া যায়।'
                    : 'A rent notice is the transparent request issued before payment. A payment receipt is the verifiable proof issued right after, building lasting trust with tenants.'}
                </p>

                <ul className="space-y-3 pt-2 text-sm text-[#F2F5F4]">
                  <li className="flex items-start gap-3 landing-check-icon">
                    <span>
                      {isBn
                        ? 'মাসের শুরুতে স্বয়ংক্রিয় মাসিক ভাড়া নোটিশ'
                        : 'Official monthly rent notices with utility breakdown for tenants'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3 landing-check-icon">
                    <span>
                      {isBn
                        ? 'টাকা জমার পর তাৎক্ষণিক প্রিন্টযোগ্য বা শেয়ারযোগ্য মানি রিসিট'
                        : 'Instant printable & WhatsApp-ready payment receipts with unique voucher IDs'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3 landing-check-icon">
                    <span>
                      {isBn
                        ? 'হাতে লেখা রসিদ বইয়ের ঝামেলা পুরোপুরি দূর'
                        : 'Eliminates paper voucher books and handwritten receipts permanently'}
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] hover:-translate-y-0.5 transition-all shadow-md"
                  >
                    <span>{isBn ? 'শুরু করুন' : 'Get Started'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Visual: Rent Notice & Receipt Mockups */}
              <div className="relative min-h-[320px] flex items-center justify-center">
                <div className="relative w-full max-w-[380px] h-[300px]">
                  {/* Rent Notice Card */}
                  <div className="absolute top-0 left-0 w-[78%] bg-[#0F1512] border border-white/15 rounded-2xl p-5 text-xs text-[#B4BEBA] shadow-2xl -rotate-3 transition-transform hover:rotate-0 hover:z-20">
                    <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2">
                      <h3 className="text-base font-normal text-[#F2F5F4]">
                        {isBn ? 'ভাড়া নোটিশ' : 'Rent Notice'}
                      </h3>
                      <span className="text-[10px] text-[#2DC2BD] bg-[#2DC2BD]/10 border border-[#2DC2BD]/20 rounded px-2 py-0.5">
                        {isBn ? 'অপেক্ষমাণ' : 'Awaiting Payment'}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between py-1 border-t border-white/[0.05]">
                        <span>{isBn ? 'ফ্ল্যাট / ইউনিট' : 'Unit'}</span>
                        <b className="text-[#F2F5F4] font-medium">4B (Dhanmondi)</b>
                      </div>
                      <div className="flex justify-between py-1 border-t border-white/[0.05]">
                        <span>{isBn ? 'মাস' : 'Month'}</span>
                        <b className="text-[#F2F5F4] font-medium">{isBn ? 'নভেম্বর ২০২৬' : 'November 2026'}</b>
                      </div>
                      <div className="flex justify-between py-1 border-t border-white/[0.05]">
                        <span>{isBn ? 'মূল ভাড়া + বিল' : 'Rent + Utilities'}</span>
                        <b className="text-[#F2F5F4] font-medium">৳22,000 + ৳3,000</b>
                      </div>
                      <div className="flex justify-between py-1 border-t border-white/[0.05] text-[#2DC2BD]">
                        <span className="font-medium">{isBn ? 'সর্বমোট দেয়' : 'Total Due'}</span>
                        <b className="font-semibold text-sm">৳25,000</b>
                      </div>
                    </div>
                  </div>

                  {/* Payment Receipt Card */}
                  <div className="absolute bottom-0 right-0 w-[78%] bg-[#10201A] border border-[#2DC2BD]/30 rounded-2xl p-5 text-xs text-[#B4BEBA] shadow-2xl rotate-2 transition-transform hover:rotate-0 hover:z-20 z-10">
                    <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2">
                      <h3 className="text-base font-normal text-[#F2F5F4]">
                        {isBn ? 'মানি রিসিট' : 'Payment Receipt'}
                      </h3>
                      <span className="text-[10px] text-[#2DC2BD] bg-[#2DC2BD]/15 border border-[#2DC2BD]/30 rounded px-2 py-0.5 font-medium">
                        ✓ {isBn ? 'পরিশোধিত' : 'Paid & Verified'}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between py-1 border-t border-white/[0.05]">
                        <span>{isBn ? 'ভাউচার নং' : 'Voucher #'}</span>
                        <b className="text-[#F2F5F4] font-mono text-[11px]">BV-2026-1104</b>
                      </div>
                      <div className="flex justify-between py-1 border-t border-white/[0.05]">
                        <span>{isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}</span>
                        <b className="text-[#F2F5F4] font-medium">bKash (MFS)</b>
                      </div>
                      <div className="flex justify-between py-1 border-t border-white/[0.05]">
                        <span>{isBn ? 'পরিশোধিত অর্থ' : 'Amount Paid'}</span>
                        <b className="text-[#2DC2BD] font-semibold text-sm">৳25,000</b>
                      </div>
                      <div className="flex justify-between py-1 border-t border-white/[0.05]">
                        <span>{isBn ? 'বর্তমান বকেয়া' : 'Remaining Balance'}</span>
                        <b className="text-[#F2F5F4] font-medium">৳0</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 4: Expenses & Net Financials [Flipped Layout] */}
            <div className="bg-[#0A0F0D] border border-white/[0.08] rounded-3xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Visual: Net Financials Card with SVG Wave */}
              <div className="order-2 lg:order-1">
                <div className="border border-white/[0.08] rounded-2xl p-6 bg-white/[0.02]">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <small className="text-xs text-[#9AA5A1] block">{isBn ? 'মোট আদায়' : 'Total Revenue'}</small>
                      <b className="text-xl font-light text-[#2DC2BD] block mt-0.5">৳184,000</b>
                    </div>
                    <div>
                      <small className="text-xs text-[#9AA5A1] block">{isBn ? 'বাড়ি খরচাপাতি' : 'Expenses'}</small>
                      <b className="text-xl font-light text-[#C6D4FF] block mt-0.5">৳28,500</b>
                    </div>
                    <div>
                      <small className="text-xs text-[#9AA5A1] block">{isBn ? 'প্রকৃত লাভ' : 'Net Income'}</small>
                      <b className="text-xl font-light text-[#F2F5F4] block mt-0.5">৳155,500</b>
                    </div>
                  </div>

                  {/* SVG Trend Wave */}
                  <div className="relative pt-2">
                    <svg
                      viewBox="0 0 300 120"
                      className="w-full h-28 overflow-visible"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="finAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#2DC2BD" stopOpacity="0.4" />
                          <stop offset="1" stopColor="#12664F" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 90C40 80 60 60 100 66S170 40 210 44 270 20 300 14V120H0z"
                        fill="url(#finAreaGrad)"
                      />
                      <path
                        d="M0 90C40 80 60 60 100 66S170 40 210 44 270 20 300 14"
                        fill="none"
                        stroke="#2DC2BD"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Pulse point at end */}
                      <circle cx="300" cy="14" r="4" fill="#2DC2BD" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#9AA5A1] mt-3 pt-3 border-t border-white/[0.06]">
                    <span>{isBn ? 'দারোয়ান, পরিচ্ছন্নতাকর্মী ও মেরামত খরচ অন্তর্ভুক্ত' : 'Includes security, cleaner & maintenance'}</span>
                    <span className="text-[#2DC2BD] font-medium">+12% {isBn ? 'মুনাফা বৃদ্ধি' : 'Net growth'}</span>
                  </div>
                </div>
              </div>

              {/* Text Information */}
              <div className="space-y-5 order-1 lg:order-2">
                <span className="inline-block text-[11px] font-semibold tracking-wider text-[#2DC2BD] border border-[#2DC2BD]/30 bg-[#12664F]/20 rounded-full px-3.5 py-1">
                  {isBn ? 'আয় ও ব্যয়ের আর্থিক প্রতিবেদন' : 'FINANCIAL OVERVIEW & EXPENSES'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#F2F5F4] leading-tight">
                  {isBn
                    ? 'বাড়ি রক্ষণাবেক্ষণ খরচ ও প্রকৃত লাভের হিসাব।'
                    : 'Track Building Expenses. See Your True Net Income.'}
                </h2>
                <p className="text-sm sm:text-base text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'দারোয়ান ও ঝাড়ুদারের বেতন, লিফট সার্ভিসিং, হোল্ডিং ট্যাক্স এবং সার্বিক মেরামত খরচ এন্ট্রি রাখুন। মাস শেষে বাড়ি থেকে প্রকৃতপক্ষে কত টাকা আয় হলো তা নিখুঁতভাবে দেখুন।'
                    : 'Track building maintenance, guard and cleaner salaries, lift repairs, and municipal taxes. See exactly how much your properties actually earn each month.'}
                </p>

                <ul className="space-y-3 pt-2 text-sm text-[#F2F5F4]">
                  <li className="flex items-start gap-3 landing-check-icon">
                    <span>
                      {isBn
                        ? 'খাতভিত্তিক খরচ ট্র্যাকিং (রক্ষণাবেক্ষণ, বেতন, বিদ্যুৎ বিল ও ট্যাক্স)'
                        : 'Categorized expense tracking (Maintenance, Staff, Generator, Taxes)'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3 landing-check-icon">
                    <span>
                      {isBn
                        ? 'নেট অপারেটিং ইনকাম (মোট আদায়কৃত ভাড়া - বাড়ি খরচ)'
                        : 'Real-time Net Operating Income (Total Collections - Property Expenses)'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3 landing-check-icon">
                    <span>
                      {isBn
                        ? 'এক ক্লিকে মাসিক ও বাৎসরিক আয়-ব্যয় রিপোর্ট ডাউনলোড'
                        : 'Exportable monthly and annual financial ledgers in PDF format'}
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] hover:-translate-y-0.5 transition-all shadow-md"
                  >
                    <span>{isBn ? 'শুরু করুন' : 'Get Started'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HOW IT WORKS (FOUR PROGRESSIVE STEPS)                                    */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-20 border-t border-white/[0.07] bg-white/[0.01]">
          <div className="max-w-[1160px] mx-auto px-5">
            <div className="max-w-xl mb-14">
              <span className="inline-block text-[11px] font-semibold tracking-wider text-[#2DC2BD] border border-[#2DC2BD]/30 bg-[#12664F]/20 rounded-full px-3.5 py-1 mb-3">
                {isBn ? 'কার্যপদ্ধতি' : 'HOW IT WORKS'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#F2F5F4]">
                {isBn
                  ? 'সহজ চার ধাপে সম্পূর্ণ ভাড়া ব্যবস্থাপনা।'
                  : 'Four simple steps from setup to peace of mind.'}
              </h2>
            </div>

            {/* Steps Timeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Step 1 */}
              <div className="relative pl-16 md:pl-0 md:pt-18 group">
                <div className="absolute left-0 top-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-lg md:text-xl font-light text-[#F2F5F4] bg-gradient-to-br from-[#2DC2BD]/40 to-[#12664F]/80 border border-white/20 shadow-[0_10px_20px_-8px_#12664F] transition-transform group-hover:scale-105">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-medium text-[#F2F5F4] mb-2">
                  {isBn ? 'বাড়ি ও ফ্ল্যাট যুক্ত করুন' : 'Add your property & units'}
                </h3>
                <p className="text-sm text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'আপনার বাড়ির নাম, ঠিকানা এবং তলা অনুযায়ী ফ্ল্যাটগুলো যুক্ত করুন।'
                    : 'Enter your building details, floors, and individual rental units in minutes.'}
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative pl-16 md:pl-0 md:pt-18 group">
                <div className="absolute left-0 top-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-lg md:text-xl font-light text-[#F2F5F4] bg-gradient-to-br from-[#2DC2BD]/40 to-[#12664F]/80 border border-white/20 shadow-[0_10px_20px_-8px_#12664F] transition-transform group-hover:scale-105">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-medium text-[#F2F5F4] mb-2">
                  {isBn ? 'ভাড়াটিয়া ও চুক্তি নিবন্ধন' : 'Register tenants & agreements'}
                </h3>
                <p className="text-sm text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'ভাড়াটিয়ার মোবাইল, এনআইডি এবং অগ্রিম জামানতের শর্তাবলী রেকর্ড রাখুন।'
                    : 'Link tenants to flats with rental agreements, NID docs, and advance security.'}
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative pl-16 md:pl-0 md:pt-18 group">
                <div className="absolute left-0 top-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-lg md:text-xl font-light text-[#F2F5F4] bg-gradient-to-br from-[#2DC2BD]/40 to-[#12664F]/80 border border-white/20 shadow-[0_10px_20px_-8px_#12664F] transition-transform group-hover:scale-105">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-medium text-[#F2F5F4] mb-2">
                  {isBn ? 'মাসিক ভাড়া ও নোটিশ ইস্যু' : 'Generate rent & issue notices'}
                </h3>
                <p className="text-sm text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'বিদ্যুৎ ও পানির বিলসহ মাসিক ভাড়া তৈরি করুন এবং ভাড়াটিয়াকে নোটিশ পাঠান।'
                    : 'Generate monthly rent records with utility splits and issue formal rent notices.'}
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative pl-16 md:pl-0 md:pt-18 group">
                <div className="absolute left-0 top-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-lg md:text-xl font-light text-[#F2F5F4] bg-gradient-to-br from-[#2DC2BD]/40 to-[#12664F]/80 border border-white/20 shadow-[0_10px_20px_-8px_#12664F] transition-transform group-hover:scale-105">
                  4
                </div>
                <h3 className="text-base sm:text-lg font-medium text-[#F2F5F4] mb-2">
                  {isBn ? 'টাকা আদায় ও মানি রিসিট' : 'Record payments & receipts'}
                </h3>
                <p className="text-sm text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'বিকাশ বা নগদ আদায় এন্ট্রি করুন এবং সাথে সাথে প্রিন্ট বা ডিজিটাল রসিদ দিন।'
                    : 'Log cash or MFS payments, calculate partial balances, and print receipts.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WHY BARIVARA (BENEFITS TAILORED FOR BANGLADESH)                           */}
        {/* ========================================================================= */}
        <section id="why-barivara" className="py-20 border-t border-white/[0.07]">
          <div className="max-w-[1160px] mx-auto px-5">
            <div className="bg-[#0A0F0D] border border-white/[0.08] rounded-3xl p-8 lg:p-12">
              <div className="max-w-2xl mb-10">
                <span className="inline-block text-[11px] font-semibold tracking-wider text-[#2DC2BD] border border-[#2DC2BD]/30 bg-[#12664F]/20 rounded-full px-3.5 py-1 mb-3">
                  {isBn ? 'কেন বাড়িভাড়া' : 'WHY BARIVARA'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#F2F5F4]">
                  {isBn
                    ? 'বাংলাদেশের বাড়িওয়ালাদের জন্য বিশেষভাবে তৈরি।'
                    : 'Built specifically for rent management in Bangladesh.'}
                </h2>
                <p className="text-sm sm:text-base text-[#9AA5A1] mt-2">
                  {isBn
                    ? 'কাগজের খাতা আর রসিদ বইয়ের যুগ শেষ। আধুনিক প্রপার্টি পরিচালনায় বাড়িভাড়া আপনার নির্ভরযোগ্য সহকারী।'
                    : 'Everything you need to run your properties profitably, with cultural grounding and zero clutter.'}
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#12664F]/30 border border-[#2DC2BD]/30 flex items-center justify-center text-[#2DC2BD] mb-4">
                    <Globe className="w-5 h-5" />
                  </div>
                  <b className="block text-base font-medium text-[#F2F5F4] mb-1.5">
                    {isBn ? 'বাংলা ও ইংরেজি উভয় ভাষায় সহজ' : 'Bangla-First & Bilingual'}
                  </b>
                  <p className="text-xs sm:text-sm text-[#9AA5A1] leading-relaxed">
                    {isBn
                      ? 'বাঙালি বাড়িওয়ালা ও ভাড়াটিয়াদের সুবিধার জন্য সম্পূর্ণ বাংলায় ব্যবহারের সুযোগ।'
                      : 'Switch between authentic Bangla and English anytime with a single click.'}
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#12664F]/30 border border-[#2DC2BD]/30 flex items-center justify-center text-[#2DC2BD] mb-4">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <b className="block text-base font-medium text-[#F2F5F4] mb-1.5">
                    {isBn ? 'বিকাশ, নগদ ও ব্যাংক রিকনসিলিয়েশন' : 'Local Payment Tracking'}
                  </b>
                  <p className="text-xs sm:text-sm text-[#9AA5A1] leading-relaxed">
                    {isBn
                      ? 'নগদ টাকা ছাড়াও বিকাশ, নগদ বা ব্যাংক ট্রান্সফারের মাধ্যমে প্রাপ্ত ভাড়ার সঠিক হিসাব।'
                      : 'Built-in tracking for cash, bKash, Nagad, Rocket, and direct bank deposits.'}
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#12664F]/30 border border-[#2DC2BD]/30 flex items-center justify-center text-[#2DC2BD] mb-4">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <b className="block text-base font-medium text-[#F2F5F4] mb-1.5">
                    {isBn ? 'ডিজিটাল মানি রিসিট (A4 ও প্রিন্ট)' : 'Printable Money Receipts'}
                  </b>
                  <p className="text-xs sm:text-sm text-[#9AA5A1] leading-relaxed">
                    {isBn
                      ? 'ভাউচার নম্বরসহ নির্ভরযোগ্য মানি রিসিট তৈরি করুন এবং হোয়াটসঅ্যাপে সহজে শেয়ার করুন।'
                      : 'Generate stamped A4 or thermal receipts that replace old carbon-paper receipt books.'}
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#12664F]/30 border border-[#2DC2BD]/30 flex items-center justify-center text-[#2DC2BD] mb-4">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <b className="block text-base font-medium text-[#F2F5F4] mb-1.5">
                    {isBn ? 'অগ্রিম জামানত ও বকেয়া হিসাব' : 'Advance Deposit Tracking'}
                  </b>
                  <p className="text-xs sm:text-sm text-[#9AA5A1] leading-relaxed">
                    {isBn
                      ? 'ভাড়াটিয়ার সিকিউরিটি ডিপোজিট ও মাসিক বকেয়া টাকার নিখুঁত হিসাব রাখুন।'
                      : 'Keep clear custody of advance deposits, deductions, and unpaid arrears.'}
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#12664F]/30 border border-[#2DC2BD]/30 flex items-center justify-center text-[#2DC2BD] mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <b className="block text-base font-medium text-[#F2F5F4] mb-1.5">
                    {isBn ? 'এনআইডি ও পুলিশ ভেরিফিকেশন প্রস্তুতি' : 'NID & Police Verification'}
                  </b>
                  <p className="text-xs sm:text-sm text-[#9AA5A1] leading-relaxed">
                    {isBn
                      ? 'ভাড়াটিয়া ও পরিবারের এনআইডি তথ্য নিরাপদে ক্লাউডে সংরক্ষণ করুন।'
                      : 'Store tenant identity photos, emergency contacts, and police verification forms securely.'}
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#12664F]/30 border border-[#2DC2BD]/30 flex items-center justify-center text-[#2DC2BD] mb-4">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <b className="block text-base font-medium text-[#F2F5F4] mb-1.5">
                    {isBn ? 'মোবাইল ও কম্পিউটার উভয় থেকেই সচল' : 'Cloud Access Anywhere'}
                  </b>
                  <p className="text-xs sm:text-sm text-[#9AA5A1] leading-relaxed">
                    {isBn
                      ? 'বাড়িওয়ালা দেশ বা প্রবাস যেখান থেকেই থাকুন, যেকোনো ডিভাইস থেকে সম্পূর্ণ হিসাব দেখতে পাবেন।'
                      : 'Manage your portfolio seamlessly from your smartphone, tablet, or home laptop.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION BANNER                                              */}
        {/* ========================================================================= */}
        <section className="py-20 border-t border-white/[0.07] relative overflow-hidden">
          <div className="max-w-[1160px] mx-auto px-5 relative z-10 text-center">
            <div className="border border-white/10 rounded-3xl p-10 lg:p-16 bg-gradient-to-b from-[#0F1D17] to-[#0A0F0D] relative overflow-hidden shadow-[0_20px_80px_-20px_rgba(18,102,79,0.5)]">
              {/* Background Glow */}
              <div
                className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-radial from-[#2DC2BD]/25 to-transparent blur-[60px]"
                aria-hidden="true"
              />

              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <span className="inline-block text-[11px] font-semibold tracking-wider text-[#2DC2BD] border border-[#2DC2BD]/30 bg-[#12664F]/30 rounded-full px-3.5 py-1">
                  {isBn ? 'আজই শুরু করুন' : 'START TODAY'}
                </span>

                <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-[#F2F5F4] leading-tight">
                  {isBn ? (
                    <>
                      আপনার বাড়িভাড়া ব্যবস্থাপনা <br />
                      <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#2DC2BD] to-white">
                        এখনই ডিজিটাল করুন।
                      </span>
                    </>
                  ) : (
                    <>
                      Ready to bring complete order <br />
                      <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#2DC2BD] to-white">
                        to your rental properties?
                      </span>
                    </>
                  )}
                </h2>

                <p className="text-sm sm:text-base text-[#9AA5A1] max-w-lg mx-auto">
                  {isBn
                    ? 'কাগজের খাতা আর হিসাবের গোলকধাঁধা থেকে মুক্তি পান। এখনই যোগ দিন বাড়িভাড়ার আধুনিক প্ল্যাটফর্মে।'
                    : 'Join property owners and managers across Bangladesh who manage properties and collections stress-free.'}
                </p>

                <div className="pt-2 flex flex-wrap justify-center gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] shadow-[0_8px_30px_-6px_rgba(18,102,79,0.9)] hover:shadow-[0_10px_35px_-6px_rgba(18,102,79,1)] hover:-translate-y-0.5 transition-all"
                  >
                    <span>{isBn ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন' : 'Create Free Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-[#F2F5F4] border border-white/20 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] transition-all hover:-translate-y-0.5"
                  >
                    <span>{isBn ? 'লগইন করুন' : 'Sign In to Account'}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* FOOTER                                                                    */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/[0.07] bg-[#050706] pt-14 pb-12 relative z-10">
        <div className="max-w-[1160px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Col 1 & 2: Brand Information */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="#top" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-white/5 p-1 flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Barivara Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold tracking-tight text-[#F2F5F4]">Barivara</span>
                  <span className="text-xs font-medium text-[#2DC2BD] font-bengali">বাড়িভাড়া</span>
                </div>
              </Link>
              <p className="text-xs text-[#9AA5A1] max-w-sm leading-relaxed">
                {isBn
                  ? 'বাংলাদেশের বাড়িওয়ালা ও প্রপার্টি ম্যানেজারদের জন্য নির্মিত আধুনিক বাড়ি ও ভাড়া ব্যবস্থাপনা সফটওয়্যার।'
                  : 'Modern rental property and billing management platform designed specifically for landlords in Bangladesh.'}
              </p>
              <div className="text-xs text-[#2DC2BD] font-medium flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isBn ? 'এনক্রিপ্টকৃত ও সম্পূর্ণ নিরাপদ ক্লাউড ডাটাবেজ' : 'Encrypted & Secure Database'}</span>
              </div>
            </div>

            {/* Col 3: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#F2F5F4] tracking-wider uppercase">
                {isBn ? 'প্রোডাক্ট' : 'Product'}
              </h4>
              <ul className="space-y-2 text-xs text-[#9AA5A1]">
                <li>
                  <Link href="#features" className="hover:text-[#F2F5F4] transition-colors">
                    {isBn ? 'ফিচারসমূহ' : 'Features'}
                  </Link>
                </li>
                <li>
                  <Link href="#dashboard-preview" className="hover:text-[#F2F5F4] transition-colors">
                    {isBn ? 'ড্যাশবোর্ড প্রিভিউ' : 'Dashboard Preview'}
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-[#F2F5F4] transition-colors">
                    {isBn ? 'কীভাবে কাজ করে' : 'How It Works'}
                  </Link>
                </li>
                <li>
                  <Link href="#why-barivara" className="hover:text-[#F2F5F4] transition-colors">
                    {isBn ? 'কেন বাড়িভাড়া' : 'Why Barivara'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Account */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#F2F5F4] tracking-wider uppercase">
                {isBn ? 'অ্যাকাউন্ট' : 'Account'}
              </h4>
              <ul className="space-y-2 text-xs text-[#9AA5A1]">
                <li>
                  <Link href="/login" className="hover:text-[#F2F5F4] transition-colors">
                    {isBn ? 'লগইন' : 'Sign In'}
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-[#F2F5F4] transition-colors">
                    {isBn ? 'রেজিস্ট্রেশন' : 'Register'}
                  </Link>
                </li>
                <li>
                  <Link href="/forgot-password" className="hover:text-[#F2F5F4] transition-colors">
                    {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password'}
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link href="/dashboard" className="text-[#2DC2BD] hover:underline font-medium">
                      {isBn ? 'ড্যাশবোর্ডে যান' : 'Go to Dashboard'}
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Col 5: Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#F2F5F4] tracking-wider uppercase">
                {isBn ? 'ভাষা ও নেভিগেশন' : 'Language & Quick'}
              </h4>
              <ul className="space-y-2 text-xs text-[#9AA5A1]">
                <li>
                  <button
                    onClick={toggleLanguage}
                    type="button"
                    className="hover:text-[#F2F5F4] transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#2DC2BD]" />
                    <span>{isBn ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}</span>
                  </button>
                </li>
                <li>
                  <Link href="#top" className="hover:text-[#F2F5F4] transition-colors">
                    {isBn ? 'পৃষ্ঠার শুরুতে যান' : 'Back to top'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-12 pt-6 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between text-xs text-[#9AA5A1]/70 gap-3">
            <p>© {new Date().getFullYear()} BariVara (বাড়িভাড়া). {isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}</p>
            <p className="flex items-center gap-1.5">
              <span>{isBn ? 'বাংলাদেশের জন্য নির্মিত' : 'Crafted with precision for Bangladesh'}</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}