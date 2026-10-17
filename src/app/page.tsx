'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguageStore, useLanguageHydrated } from '@/stores/language-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  Building2,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Globe,
  MessageCircle,
  Lock,
  Clock,
  Check,
  FileText,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const { language, setLanguage } = useLanguageStore();
  const languageHydrated = useLanguageHydrated();
  const { isAuthenticated } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'registry' | 'tenant' | 'billing' | 'receipts'>('registry');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const [calcUnits, setCalcUnits] = useState<number>(12);

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

  const formatBDT = (val: number) => {
    return '৳' + val.toLocaleString('en-IN');
  };

  // Verified monthly collection data
  const monthsData = [
    { name: isBn ? 'জুন' : 'Jun', collected: 165000, outstanding: 15000, collectedPct: 75, outstandingPct: 15 },
    { name: isBn ? 'জুলাই' : 'Jul', collected: 172000, outstanding: 9000, collectedPct: 82, outstandingPct: 8 },
    { name: isBn ? 'আগস্ট' : 'Aug', collected: 168000, outstanding: 16000, collectedPct: 78, outstandingPct: 14 },
    { name: isBn ? 'সেপ্টেম্বর' : 'Sep', collected: 180000, outstanding: 8000, collectedPct: 88, outstandingPct: 7 },
    { name: isBn ? 'অক্টোবর' : 'Oct', collected: 176000, outstanding: 12000, collectedPct: 84, outstandingPct: 11 },
    { name: isBn ? 'নভেম্বর' : 'Nov', collected: 184000, outstanding: 36000, collectedPct: 92, outstandingPct: 18 },
  ];

  // Calculated estimates based on unit slider
  const avgRentPerUnit = 24000;
  const estimatedMonthlyTotal = calcUnits * avgRentPerUnit;
  const hoursSavedPerMonth = Math.round(calcUnits * 1.5);

  const fadeInVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: (customDelay: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0.01 }
        : {
            duration: 0.35,
            delay: customDelay,
            ease: [0.2, 0.8, 0.2, 1] as const,
          },
    }),
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#171717] font-sans selection:bg-[#12664F] selection:text-white relative overflow-x-hidden antialiased">
      {/* ========================================================================= */}
      {/* 1. SOLID ARCHITECTURAL STICKY HEADER                                      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#0B1914] border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <Link href="#top" className="flex items-center gap-2.5 landing-focus">
            <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 border border-white/20 bg-white/10 p-1 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="BariVara Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white font-heading">BariVara</span>
              <span className="text-xs font-semibold text-[#10B981] font-bengali">বাড়িভাড়া</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-[#B8C7C1]" aria-label="Main Navigation">
            <Link href="#capabilities" className="hover:text-white transition-colors landing-focus py-1">
              {isBn ? 'কার্যপদ্ধতি' : 'Workflow'}
            </Link>
            <Link href="#calculator" className="hover:text-white transition-colors landing-focus py-1">
              {isBn ? 'ক্যালকুলেটর' : 'Calculator'}
            </Link>
            <Link href="#ledger" className="hover:text-white transition-colors landing-focus py-1">
              {isBn ? 'আর্থিক খতিয়ান' : 'Ledger Demo'}
            </Link>
            <Link href="#standards" className="hover:text-white transition-colors landing-focus py-1">
              {isBn ? 'আইনি ও নিরাপত্তা' : 'Local Compliance'}
            </Link>
            <Link href="#comparison" className="hover:text-white transition-colors landing-focus py-1">
              {isBn ? 'তুলনামূলক পার্থক্য' : 'Comparison'}
            </Link>
          </nav>

          {/* Action Cluster */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#D1E0DA] hover:text-white border border-white/20 hover:border-white/40 bg-white/5 transition-colors cursor-pointer landing-focus"
              title={isBn ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Globe className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="font-mono">{isBn ? 'EN' : 'বাংলা'}</span>
            </button>

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-bold text-white bg-[#12664F] hover:bg-[#0E513F] transition-colors landing-focus"
              >
                <span>{isBn ? 'ড্যাশবোর্ডে যান' : 'Open Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-[#D1E0DA] hover:text-white transition-colors landing-focus"
                >
                  {isBn ? 'লগইন' : 'Sign In'}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-bold text-white bg-[#12664F] hover:bg-[#0E513F] transition-colors landing-focus"
                >
                  <span>{isBn ? 'বিনামূল্যে শুরু করুন' : 'Start Free'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleLanguage}
              type="button"
              className="px-2 py-1 rounded-md text-xs font-semibold text-white border border-white/20 bg-white/5 landing-focus"
            >
              {isBn ? 'EN' : 'বাং'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-white border border-white/20 bg-white/5 landing-focus"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-white/10 bg-[#0B1914] px-6 py-4 space-y-3">
            <Link
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#B8C7C1] hover:text-white py-1"
            >
              {isBn ? 'কার্যপদ্ধতি' : 'Workflow'}
            </Link>
            <Link
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#B8C7C1] hover:text-white py-1"
            >
              {isBn ? 'ক্যালকুলেটর' : 'Calculator'}
            </Link>
            <Link
              href="#ledger"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#B8C7C1] hover:text-white py-1"
            >
              {isBn ? 'আর্থিক খতিয়ান' : 'Ledger Demo'}
            </Link>
            <Link
              href="#standards"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#B8C7C1] hover:text-white py-1"
            >
              {isBn ? 'আইনি ও নিরাপত্তা' : 'Local Compliance'}
            </Link>
            <Link
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#B8C7C1] hover:text-white py-1"
            >
              {isBn ? 'তুলনামূলক পার্থক্য' : 'Comparison'}
            </Link>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-md text-xs font-bold text-white bg-[#12664F]"
                >
                  {isBn ? 'ড্যাশবোর্ডে যান' : 'Open Dashboard'}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-medium text-[#B8C7C1] hover:text-white"
                  >
                    {isBn ? 'লগইন' : 'Sign In'}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-md text-xs font-bold text-white bg-[#12664F]"
                  >
                    {isBn ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন' : 'Start Free'}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="top" className="relative z-10">
        {/* ========================================================================= */}
        {/* 2. HERO SECTION: CONCRETE VALUE PROPOSITION & ARCHITECTURAL EVIDENCE     */}
        {/* ========================================================================= */}
        <section className="bg-[#0B1914] text-white pt-14 md:pt-20 pb-16 md:pb-22 border-b border-white/10">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Specific, Concrete Messaging */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Structural Kicker */}
                <motion.div
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/15 text-xs font-mono font-semibold text-[#10B981]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>
                    {isBn
                      ? 'বাড়িওয়ালাদের জন্য প্রপার্টি প্ল্যাটফর্ম'
                      : 'PROPERTY & TENANCY PLATFORM BUILT FOR BANGLADESH'}
                  </span>
                </motion.div>

                {/* Concrete Display Headline */}
                <motion.h1
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.05}
                  className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-white font-heading tracking-tight leading-[1.15]"
                >
                  {isBn ? (
                    <>
                      ফ্ল্যাট রেজিস্ট্রি, ডেসকো বিদ্যুৎ বিল বণ্টন এবং ১-ক্লিক মানি রিসিট।
                    </>
                  ) : (
                    <>
                      Property registry, utility splitting, and rent collection for landlords.
                    </>
                  )}
                </motion.h1>

                {/* Subhead with Plain Language */}
                <motion.p
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.1}
                  className="text-base sm:text-lg text-[#C2D8D1] max-w-xl font-normal leading-relaxed"
                >
                  {isBn
                    ? 'কাগজের খাতার হিসাব বন্ধ করুন। ভবন ও ফ্ল্যাটের তথ্য সংরক্ষণ করুন, ডেসকো বিদ্যুৎ ও ওয়াসা বিল নির্ভুলভাবে ভাগ করে নোটিশ তৈরি করুন, বিকাশ লেনদেন মেলান এবং তাৎক্ষণিক হোয়াটসঅ্যাপে মানি রিসিট পাঠান।'
                    : 'Manage multi-unit buildings and tenant agreements across Bangladesh. Calculate individual DESCO electricity and WASA splits on the 1st of every month, reconcile bKash payments, and dispatch formal PDF receipts.'}
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.15}
                  className="flex flex-wrap items-center gap-3 pt-2"
                >
                  <Link
                    href={isAuthenticated ? '/dashboard' : '/register'}
                    className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-bold text-white bg-[#12664F] hover:bg-[#0E513F] transition-colors landing-focus"
                  >
                    <span>
                      {isAuthenticated
                        ? isBn
                          ? 'ড্যাশবোর্ডে প্রবেশ করুন'
                          : 'Go to Your Dashboard'
                        : isBn
                        ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন'
                        : 'Start Free Account'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="#ledger"
                    className="inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold text-[#D1E0DA] hover:text-white border border-white/20 hover:border-white/40 bg-white/5 transition-colors landing-focus"
                  >
                    <span>{isBn ? 'লাইভ ডেমো খতিয়ান দেখুন' : 'Inspect Ledger Demo'}</span>
                  </Link>
                </motion.div>

                {/* Concrete Operational Highlights */}
                <motion.div
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.2}
                  className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#9EBAB0] font-mono border-t border-white/10"
                >
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>DESCO / DPDC Sub-meter Math</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>bKash & Nagad TrxID Match</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>DMP Police Form Export</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Grounded Architectural Stage & Real Status Ledger */}
              <motion.div
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                custom={0.12}
                className="lg:col-span-5"
              >
                <div className="rounded-lg border border-white/15 bg-[#10241E] overflow-hidden">
                  {/* Photo Frame */}
                  <div className="relative h-60 sm:h-72 w-full bg-[#081411]">
                    <Image
                      src="/hero-building.jpg"
                      alt="Modern residential apartment building"
                      fill
                      priority
                      className="object-cover object-center"
                    />
                    <div className="absolute top-3 left-3 bg-[#0B1914]/90 border border-white/20 px-2.5 py-1 rounded text-[11px] font-mono font-medium text-white">
                      {isBn ? 'গ্রিন ভ্যালি টাওয়ার · মিরপুর-১০' : 'Green Valley Residence · Mirpur-10'}
                    </div>
                  </div>

                  {/* Real Status Bar Under Building */}
                  <div className="p-4 space-y-3 bg-[#10241E] border-t border-white/10 text-xs text-white">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#10B981]" />
                        <span className="font-semibold">{isBn ? '২৪টি ইউনিট নিবন্ধিত' : '24 Units Registered'}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                        {isBn ? '২৩টি ফ্ল্যাট অকুপাইড' : '23 Occupied · 1 Vacant'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-[#A8C7BD]">
                        <span>{isBn ? 'নভেম্বর ভাড়া আদায় খতিয়ান' : 'November Collection Progress'}</span>
                        <span className="font-mono font-bold text-white">৳ ৫,৪৪,০০০ / ৫,৮০,০০০ (৯৩.৮%)</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-sm overflow-hidden">
                        <div className="h-full bg-[#12664F] w-[93.8%]" />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#A8C7BD] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        <span>{isBn ? 'ফ্ল্যাট ৪বি · বিকাশ প্রাপ্তি ৳২৮,০০০' : 'Flat 4B: bKash ৳28,000 Verified'}</span>
                      </div>
                      <span className="text-white font-medium">{isBn ? 'রিসিট #BV-8921' : 'Voucher #BV-8921'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. CAPABILITIES & WORKFLOW: ASYMMETRICAL MASTER-DETAIL LAYOUT             */}
        {/* ========================================================================= */}
        <section id="capabilities" className="py-16 md:py-24 bg-[#FAFAF9] border-b border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto px-5">
            {/* Left-Aligned Editorial Section Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-12">
              <div className="lg:col-span-7 space-y-2">
                <span className="editorial-kicker text-[#12664F] block">
                  {isBn ? 'মূল কার্যপদ্ধতি' : 'STRUCTURED WORKFLOW'}
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#171717] font-heading tracking-tight">
                  {isBn
                    ? 'বাড়ি নিবন্ধন থেকে ভাড়া আদায় ও রিসিট—চারটি ধারাবাহিক ধাপ'
                    : 'Four structured operational steps from property intake to stamped receipt'}
                </h2>
              </div>
              <div className="lg:col-span-5 text-sm text-[#525252] leading-relaxed">
                {isBn
                  ? 'কাগজের খাতা এবং অগোছালো হোয়াটসঅ্যাপ মেসেজের বদলে একটি স্থায়ী, আইনি ক্লাউড খতিয়ান বজায় রাখুন।'
                  : 'Replace lost notebook entries, disputed utility bills, and manual receipt writing with an auditable local tenancy workflow.'}
              </div>
            </div>

            {/* Asymmetrical Master-Detail Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Step Selector (Left 4 cols) */}
              <div className="lg:col-span-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveWorkflowTab('registry')}
                  className={`w-full text-left p-4 rounded-md border transition-colors ${
                    activeWorkflowTab === 'registry'
                      ? 'bg-white border-[#12664F] shadow-xs'
                      : 'bg-transparent border-[#E5E7EB] hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#12664F]">01</span>
                    {activeWorkflowTab === 'registry' && <span className="w-2 h-2 rounded-full bg-[#12664F]" />}
                  </div>
                  <h3 className="text-sm font-bold text-[#171717]">
                    {isBn ? 'ফ্ল্যাট ও ইউনিট রেজিস্ট্রি' : 'Property & Unit Registry'}
                  </h3>
                  <p className="text-xs text-[#525252] mt-1 leading-normal">
                    {isBn
                      ? 'ভবনের তলা, ফ্ল্যাট নম্বর, রুম বিন্যাস এবং বিদ্যুৎ মিটার তালিকা।'
                      : 'Record buildings, floors, unit layouts, and linked DESCO meters.'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveWorkflowTab('tenant')}
                  className={`w-full text-left p-4 rounded-md border transition-colors ${
                    activeWorkflowTab === 'tenant'
                      ? 'bg-white border-[#12664F] shadow-xs'
                      : 'bg-transparent border-[#E5E7EB] hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#12664F]">02</span>
                    {activeWorkflowTab === 'tenant' && <span className="w-2 h-2 rounded-full bg-[#12664F]" />}
                  </div>
                  <h3 className="text-sm font-bold text-[#171717]">
                    {isBn ? 'ভাড়াটিয়া এনআইডি ও চুক্তি' : 'Tenant Profiles & Agreements'}
                  </h3>
                  <p className="text-xs text-[#525252] mt-1 leading-normal">
                    {isBn
                      ? 'জাতীয় পরিচয়পত্র, জামানতের টাকা ও ডিএমপি পুলিশ ভেরিফিকেশন রেকর্ড।'
                      : 'NID records, advance security deposits, and legal lease dates.'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveWorkflowTab('billing')}
                  className={`w-full text-left p-4 rounded-md border transition-colors ${
                    activeWorkflowTab === 'billing'
                      ? 'bg-white border-[#12664F] shadow-xs'
                      : 'bg-transparent border-[#E5E7EB] hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#12664F]">03</span>
                    {activeWorkflowTab === 'billing' && <span className="w-2 h-2 rounded-full bg-[#12664F]" />}
                  </div>
                  <h3 className="text-sm font-bold text-[#171717]">
                    {isBn ? 'ইউটিলিটি ও বিল বণ্টন' : 'Utility Math & Monthly Bills'}
                  </h3>
                  <p className="text-xs text-[#525252] mt-1 leading-normal">
                    {isBn
                      ? 'সাব-মিটার ইউনিট, তিতাস গ্যাস ও লিফট সার্ভিস চার্জ বণ্টন।'
                      : 'Apportion electricity sub-meters, gas charges, and water fees.'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveWorkflowTab('receipts')}
                  className={`w-full text-left p-4 rounded-md border transition-colors ${
                    activeWorkflowTab === 'receipts'
                      ? 'bg-white border-[#12664F] shadow-xs'
                      : 'bg-transparent border-[#E5E7EB] hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#12664F]">04</span>
                    {activeWorkflowTab === 'receipts' && <span className="w-2 h-2 rounded-full bg-[#12664F]" />}
                  </div>
                  <h3 className="text-sm font-bold text-[#171717]">
                    {isBn ? 'বিকাশ আদায় ও মানি রিসিট' : 'bKash Tracking & WhatsApp Receipts'}
                  </h3>
                  <p className="text-xs text-[#525252] mt-1 leading-normal">
                    {isBn
                      ? 'TrxID ভেরিফিকেশন এবং ১ ক্লিকে হোয়াটসঅ্যাপে পিডিএফ রিসিট।'
                      : 'Verify transaction IDs and dispatch stamped receipts in seconds.'}
                  </p>
                </button>
              </div>

              {/* Detail Mockup Panel (Right 8 cols) */}
              <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-lg p-6 sm:p-8">
                {activeWorkflowTab === 'registry' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                      <div>
                        <div className="text-xs font-mono font-semibold text-[#12664F]">PROPERTY REGISTER VIEW</div>
                        <h4 className="text-base font-bold text-[#171717]">গ্রিন ভ্যালি রেসিডেন্সিয়াল টাওয়ার (২৪টি ফ্ল্যাট)</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-medium bg-[#12664F]/10 text-[#12664F]">
                        ৩টি তলা · মিরপুর-১০, ঢাকা
                      </span>
                    </div>

                    <div className="border border-[#E5E7EB] rounded-md divide-y divide-[#E5E7EB] text-xs">
                      <div className="p-3 bg-[#F9FAF9] grid grid-cols-12 font-semibold text-[#525252]">
                        <span className="col-span-4">ফ্ল্যাট নম্বর ও লেআউট</span>
                        <span className="col-span-4">ডেসকো সাব-মিটার</span>
                        <span className="col-span-2 text-right">মাসিক ভাড়া</span>
                        <span className="col-span-2 text-right">স্ট্যাটাস</span>
                      </div>

                      <div className="p-3 grid grid-cols-12 items-center">
                        <span className="col-span-4 font-semibold text-[#171717]">ফ্ল্যাট ৩এ (৩ বেড, ২ বাথ)</span>
                        <span className="col-span-4 font-mono text-gray-600">মিটার #DESCO-982141</span>
                        <span className="col-span-2 font-mono font-bold text-right text-gray-900">৳২৬,০০০</span>
                        <span className="col-span-2 text-right font-medium text-[#10B981]">অকুপাইড</span>
                      </div>

                      <div className="p-3 grid grid-cols-12 items-center">
                        <span className="col-span-4 font-semibold text-[#171717]">ফ্ল্যাট ৩বি (২ বেড, ২ বাথ)</span>
                        <span className="col-span-4 font-mono text-gray-600">মিটার #DESCO-982142</span>
                        <span className="col-span-2 font-mono font-bold text-right text-gray-900">৳২২,০০০</span>
                        <span className="col-span-2 text-right font-medium text-[#D97706]">খালি আছে</span>
                      </div>

                      <div className="p-3 grid grid-cols-12 items-center">
                        <span className="col-span-4 font-semibold text-[#171717]">ফ্ল্যাট ৪এ (৩ বেড, ৩ বাথ)</span>
                        <span className="col-span-4 font-mono text-gray-600">মিটার #DESCO-982143</span>
                        <span className="col-span-2 font-mono font-bold text-right text-gray-900">৳২৮,০০০</span>
                        <span className="col-span-2 text-right font-medium text-[#10B981]">অকুপাইড</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeWorkflowTab === 'tenant' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                      <div>
                        <div className="text-xs font-mono font-semibold text-[#12664F]">TENANT VERIFICATION & RECORD</div>
                        <h4 className="text-base font-bold text-[#171717]">মোঃ কামাল হোসেন · ফ্ল্যাট ৩এ</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                        NID ভেরিফায়েড
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded border border-[#E5E7EB] space-y-1">
                        <span className="text-gray-500 font-medium block">জাতীয় পরিচয়পত্র (NID)</span>
                        <span className="font-mono font-bold text-gray-900 block">৮২৭৩ ৪১৯২ ৯১০২</span>
                        <span className="text-gray-400 text-[11px] block">স্মার্ট কার্ড যাচাই সম্পন্ন</span>
                      </div>

                      <div className="p-3 rounded border border-[#E5E7EB] space-y-1">
                        <span className="text-gray-500 font-medium block">জরুরি যোগাযোগ ও মোবাইল</span>
                        <span className="font-mono font-bold text-gray-900 block">০১৭XX-XXXXXX</span>
                        <span className="text-gray-400 text-[11px] block">হোয়াটসঅ্যাপ সক্রিয়</span>
                      </div>

                      <div className="p-3 rounded border border-[#E5E7EB] space-y-1">
                        <span className="text-gray-500 font-medium block">অগ্রিম জামানত (Security Deposit)</span>
                        <span className="font-mono font-bold text-gray-900 text-sm block">৳ ৫২,০০০</span>
                        <span className="text-gray-400 text-[11px] block">২ মাসের ভাড়া জামানত সংরক্ষিত</span>
                      </div>

                      <div className="p-3 rounded border border-[#E5E7EB] space-y-1">
                        <span className="text-gray-500 font-medium block">চুক্তির মেয়াদ ও ডিএমপি ফরম</span>
                        <span className="font-bold text-gray-900 block">১ জানু ২০২৬ – ৩১ ডিসে ২০২৬</span>
                        <span className="text-[#12664F] text-[11px] font-medium block">DMP CIMS ফরম প্রস্তুত</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeWorkflowTab === 'billing' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                      <div>
                        <div className="text-xs font-mono font-semibold text-[#12664F]">ITEMIZED UTILITY APPORTIONMENT</div>
                        <h4 className="text-base font-bold text-[#171717]">নভেম্বর ২০২৬ ভাড়ার হিসাব নোটিশ · ফ্ল্যাট ৩এ</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-gray-100 text-gray-800">
                        বিল ইস্যু: ১ নভেম্বর ২০২৬
                      </span>
                    </div>

                    <div className="border border-[#E5E7EB] rounded-md divide-y divide-[#E5E7EB] text-xs">
                      <div className="p-2.5 flex justify-between text-gray-700">
                        <span>মূল ফ্ল্যাট ভাড়া (Basic Rent)</span>
                        <span className="font-mono font-semibold text-gray-900">৳ ২৬,০০০</span>
                      </div>
                      <div className="p-2.5 flex justify-between text-gray-700">
                        <span>বিদ্যুৎ সাব-মিটার (DESCO ২৯৫ ইউনিট × ৮.৩০ টাকা)</span>
                        <span className="font-mono font-semibold text-gray-900">৳ ২,৪৪৮</span>
                      </div>
                      <div className="p-2.5 flex justify-between text-gray-700">
                        <span>তিতাস গ্যাস বণ্টন (Fixed Double Burner)</span>
                        <span className="font-mono font-semibold text-gray-900">৳ ১,০৮০</span>
                      </div>
                      <div className="p-2.5 flex justify-between text-gray-700">
                        <span>ওয়াসা পানি ও বিল্ডিং সার্ভিস চার্জ</span>
                        <span className="font-mono font-semibold text-gray-900">৳ ১,৫০০</span>
                      </div>
                      <div className="p-3 bg-[#F9FAF9] flex justify-between text-sm font-bold text-[#12664F]">
                        <span>সর্বমোট প্রদেয় টাকা (Total Payable)</span>
                        <span className="font-mono text-base">৳ ৩১,০২৮</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeWorkflowTab === 'receipts' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                      <div>
                        <div className="text-xs font-mono font-semibold text-[#12664F]">VERIFIED RECEIPT DISPATCH</div>
                        <h4 className="text-base font-bold text-[#171717]">মানি রিসিট ভাউচার #VR-2026-941</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#10B981]/15 text-[#10B981]">
                        পরিশোধিত (Paid)
                      </span>
                    </div>

                    <div className="p-4 rounded-md border border-[#E5E7EB] bg-[#F9FAF9] space-y-3 text-xs">
                      <div className="flex justify-between items-center text-gray-600">
                        <span>ভাড়াটিয়া: মোঃ কামাল হোসেন (ফ্ল্যাট ৩এ)</span>
                        <span className="font-mono">তারিখ: ৩ নভেম্বর ২০২৬</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>পেমেন্ট মাধ্যম: বিকাশ (Merchant Payment)</span>
                        <span className="font-mono font-bold text-gray-900">TrxID: 9X2K48L90P</span>
                      </div>
                      <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-center">
                        <div>
                          <span className="text-gray-500 block text-[11px]">আদায়কৃত সর্বমোট টাকা:</span>
                          <span className="text-lg font-bold font-mono text-[#12664F]">৳ ৩১,০২৮</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded text-xs font-bold bg-[#25D366] text-white flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp PDF Sent</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. GROUNDED CALCULATOR: UNIT COUNT & REAL FINANCIAL METRICS               */}
        {/* ========================================================================= */}
        <section id="calculator" className="py-16 md:py-24 bg-white border-b border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Calculator Controls */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <span className="editorial-kicker text-[#12664F] block">
                    {isBn ? 'ইউনিট ক্যালকুলেটর' : 'ESTIMATED SCALE & WORKLOAD'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] font-heading tracking-tight">
                    {isBn
                      ? 'আপনার ফ্ল্যাট সংখ্যার ভিত্তিতে কাজের সময় ও আর্থিক আয়তন নির্ধারণ করুন'
                      : 'Calculate protected rent and management hours saved each month'}
                  </h2>
                  <p className="text-sm text-[#525252]">
                    {isBn
                      ? 'ফ্ল্যাট সংখ্যা নির্বাচন করে দেখুন মাসিক কত টাকার ভাড়া খতিয়ান ডিজিটাল রেকর্ডে পরিচালিত হবে।'
                      : 'Select your total managed units to estimate monthly rent protected and manual collection time saved.'}
                  </p>
                </div>

                <div className="p-6 rounded-md border border-[#E5E7EB] bg-[#FAFAF9] space-y-4">
                  <div className="flex justify-between items-center">
                    <label htmlFor="unit-slider" className="text-sm font-bold text-[#171717]">
                      {isBn ? 'আপনার মোট ফ্ল্যাট / ইউনিটের সংখ্যা:' : 'Total Managed Rental Units:'}
                    </label>
                    <span className="text-xl font-bold font-mono text-[#12664F] bg-white border border-[#E5E7EB] px-3 py-1 rounded">
                      {calcUnits} {isBn ? 'টি' : 'Units'}
                    </span>
                  </div>

                  <input
                    id="unit-slider"
                    type="range"
                    min="2"
                    max="60"
                    step="1"
                    value={calcUnits}
                    onChange={(e) => setCalcUnits(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-[#E5E7EB] rounded appearance-none cursor-pointer accent-[#12664F]"
                  />

                  <div className="flex justify-between text-[11px] font-mono text-gray-500">
                    <span>২ ফ্ল্যাট</span>
                    <span>২০ ফ্ল্যাট</span>
                    <span>৪০ ফ্ল্যাট</span>
                    <span>৬০+ ফ্ল্যাট</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Solid Dark Financial Panel */}
              <div className="lg:col-span-5 bg-[#0B1914] text-white rounded-lg border border-white/10 p-6 sm:p-8 space-y-5">
                <div>
                  <span className="text-xs font-mono text-[#9EBAB0] block">
                    {isBn ? 'মাসিক সম্ভাব্য পরিচালিত ভাড়া' : 'Monthly Rent Administered'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-bold text-[#10B981] font-mono mt-1">
                    {formatBDT(estimatedMonthlyTotal)}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#9EBAB0] block">
                      {isBn ? 'হিসাব ও তাগাদায় সাশ্রয়' : 'Admin Time Saved'}
                    </span>
                    <span className="text-lg font-bold text-white font-mono mt-0.5 block">
                      ~{hoursSavedPerMonth} {isBn ? 'ঘণ্টা' : 'Hours/mo'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#9EBAB0] block">
                      {isBn ? 'বিদ্যুৎ বিলের ভুল' : 'Apportionment Errors'}
                    </span>
                    <span className="text-lg font-bold text-[#10B981] font-mono mt-0.5 block">
                      ০% (Zero)
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/register"
                    className="w-full block text-center py-3 rounded-md text-xs font-bold text-white bg-[#12664F] hover:bg-[#0E513F] transition-colors"
                  >
                    {isBn ? 'বিনামূল্যে সেটআপ শুরু করুন' : 'Start Free Setup'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. HANDS-ON FINANCIAL LEDGER DEMO (NO GRADIENTS, HONEST DATA)              */}
        {/* ========================================================================= */}
        <section id="ledger" className="py-16 md:py-24 bg-[#FAFAF9] border-b border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto px-5">
            {/* Header */}
            <div className="max-w-2xl text-left mb-10 space-y-2">
              <span className="editorial-kicker text-[#12664F] block">
                {isBn ? 'লাইভ ড্যাশবোর্ড খতিয়ান' : 'FINANCIAL AUDIT TRAIL'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] font-heading tracking-tight">
                {isBn
                  ? 'মাসিক ভাড়া আদায় ও বকেয়ার বাস্তবসম্মত ড্যাশবোর্ড'
                  : 'Real-time collection status and monthly arrears tracking'}
              </h2>
              <p className="text-sm text-[#525252]">
                {isBn
                  ? 'নিচের বারে মাউস রেখে গত ৬ মাসের কালেকশন ও বকেয়া পর্যবেক্ষণ করুন।'
                  : 'Inspect collection rates, pending units, and payment channels across your properties.'}
              </p>
            </div>

            {/* Dark Structured Container */}
            <div className="bg-[#0B1914] border border-white/10 rounded-lg p-6 sm:p-8 text-white space-y-6">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isBn ? 'গ্রিন ভ্যালি টাওয়ার · সার্বিক আয়-ব্যয় খতিয়ান' : 'Green Valley Tower · Monthly Financial Ledger'}
                  </h3>
                  <p className="text-xs text-[#9EBAB0]">
                    {isBn ? '২৪টি ইউনিটের লাইভ সামারি ও আদায় হার' : 'Live occupancy and collection reconciliation'}
                  </p>
                </div>
                <span className="text-xs font-mono font-medium px-3 py-1 rounded bg-white/5 border border-white/15 text-[#10B981]">
                  {isBn ? 'চলতি মাস: নভেম্বর ২০২৬' : 'Current Cycle: November 2026'}
                </span>
              </div>

              {/* 4 Financial Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded border border-white/10 bg-white/5">
                  <span className="text-xs text-[#9EBAB0] block mb-1">{isBn ? 'মোট সম্ভাব্য ভাড়া' : 'Target Rent (Nov)'}</span>
                  <div className="text-xl font-bold font-mono text-white">৳ ৫,৮০,০০০</div>
                  <div className="text-[11px] text-gray-400 mt-1">২৪টি ইউনিট অন্তর্ভুক্ত</div>
                </div>

                <div className="p-4 rounded border border-white/10 bg-white/5">
                  <span className="text-xs text-[#9EBAB0] block mb-1">{isBn ? 'আদায়কৃত টাকা' : 'Collected Amount'}</span>
                  <div className="text-xl font-bold font-mono text-[#10B981]">৳ ৫,৪৪,০০০</div>
                  <div className="text-[11px] text-[#10B981] mt-1">৯৩.৮% আদায় সম্পন্ন</div>
                </div>

                <div className="p-4 rounded border border-white/10 bg-white/5">
                  <span className="text-xs text-[#9EBAB0] block mb-1">{isBn ? 'বকেয়া টাকা' : 'Outstanding Arrears'}</span>
                  <div className="text-xl font-bold font-mono text-[#D97706]">৳ ৩৬,০০০</div>
                  <div className="text-[11px] text-[#D97706] mt-1">১টি ফ্ল্যাটে বকেয়া আছে</div>
                </div>

                <div className="p-4 rounded border border-white/10 bg-white/5">
                  <span className="text-xs text-[#9EBAB0] block mb-1">{isBn ? 'ডিজিটাল পেমেন্ট অনুপাত' : 'MFS & Bank Ratio'}</span>
                  <div className="text-xl font-bold font-mono text-white">৭৮%</div>
                  <div className="text-[11px] text-gray-400 mt-1">বিকাশ ও ব্যাংক ট্রান্সফার</div>
                </div>
              </div>

              {/* 6-Month Bar Chart (Solid Single Hue, No Gradient Clutter) */}
              <div className="p-5 rounded border border-white/10 bg-[#081411]">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-bold uppercase text-white">
                    {isBn ? 'গত ৬ মাসের ভাড়া আদায় ট্রেন্ড' : '6-Month Rent Collection Trend'}
                  </span>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-[#10B981]">
                      <span className="w-2.5 h-2.5 bg-[#12664F] rounded-xs" /> {isBn ? 'আদায়কৃত' : 'Collected'}
                    </span>
                    <span className="flex items-center gap-1.5 text-[#D97706]">
                      <span className="w-2.5 h-2.5 bg-[#D97706] rounded-xs" /> {isBn ? 'বকেয়া' : 'Arrears'}
                    </span>
                  </div>
                </div>

                {/* Bars Container */}
                <div className="h-40 flex items-end justify-between gap-3 pt-4 border-b border-white/10 px-2">
                  {monthsData.map((m, idx) => (
                    <div
                      key={m.name}
                      onMouseEnter={() => setHoveredMonthIndex(idx)}
                      onMouseLeave={() => setHoveredMonthIndex(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    >
                      {hoveredMonthIndex === idx && (
                        <div className="bg-white text-gray-900 text-[10px] font-bold py-1 px-2 rounded mb-1 whitespace-nowrap font-mono shadow-md">
                          {formatBDT(m.collected)}
                        </div>
                      )}

                      <div className="w-full max-w-[36px] flex items-end gap-1 h-full">
                        <div
                          style={{ height: `${m.collectedPct}%` }}
                          className="w-1/2 bg-[#12664F] rounded-t-xs transition-opacity group-hover:opacity-80"
                        />
                        <div
                          style={{ height: `${m.outstandingPct}%` }}
                          className="w-1/2 bg-[#D97706] rounded-t-xs transition-opacity group-hover:opacity-80"
                        />
                      </div>
                      <span className="text-[11px] text-[#9EBAB0] mt-2 font-mono">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Realistic Tabular Rent Roll Snippet */}
              <div className="border border-white/10 rounded overflow-x-auto text-xs font-mono">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10 text-[#9EBAB0]">
                    <tr>
                      <th className="py-2.5 px-3">ফ্ল্যাট নম্বর</th>
                      <th className="py-2.5 px-3">ভাড়াটিয়া</th>
                      <th className="py-2.5 px-3">ভাড়া পরিমাণ</th>
                      <th className="py-2.5 px-3">পেমেন্ট মাধ্যম</th>
                      <th className="py-2.5 px-3">স্ট্যাটাস</th>
                      <th className="py-2.5 px-3 text-right">রিসিট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">ফ্ল্যাট ৩এ</td>
                      <td className="py-2.5 px-3 text-[#C2D8D1]">মোঃ কামাল হোসেন</td>
                      <td className="py-2.5 px-3">৳ ২৬,০০০</td>
                      <td className="py-2.5 px-3 text-[#10B981]">bKash (TrxID #9X2K...)</td>
                      <td className="py-2.5 px-3"><span className="text-[#10B981] font-bold">পরিশোধিত</span></td>
                      <td className="py-2.5 px-3 text-right text-gray-400">#VR-8921</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">ফ্ল্যাট ৩বি</td>
                      <td className="py-2.5 px-3 text-gray-400">-</td>
                      <td className="py-2.5 px-3 text-gray-400">৳ ২২,০০০</td>
                      <td className="py-2.5 px-3 text-gray-400">-</td>
                      <td className="py-2.5 px-3"><span className="text-[#D97706] font-bold">খালি ফ্ল্যাট</span></td>
                      <td className="py-2.5 px-3 text-right text-gray-400">-</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">ফ্ল্যাট ৪এ</td>
                      <td className="py-2.5 px-3 text-[#C2D8D1]">জনাব রফিকুল আলম</td>
                      <td className="py-2.5 px-3">৳ ২৮,০০০</td>
                      <td className="py-2.5 px-3 text-gray-400">ব্যাংক ট্রান্সফার</td>
                      <td className="py-2.5 px-3"><span className="text-[#D97706] font-bold">বকেয়া (৫ দিন)</span></td>
                      <td className="py-2.5 px-3 text-right text-[#10B981]">নোটিশ প্রেরিত</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. BANGLADESH LOCAL COMPLIANCE & LEGAL ACCORDANCE                         */}
        {/* ========================================================================= */}
        <section id="standards" className="py-16 md:py-24 bg-white border-b border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto px-5">
            {/* Editorial Header */}
            <div className="max-w-2xl text-left mb-12 space-y-2">
              <span className="editorial-kicker text-[#12664F] block">
                {isBn ? 'বাস্তব উপযোগিতা' : 'LOCAL COMPLIANCE & LEGAL ACCORDANCE'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] font-heading tracking-tight">
                {isBn
                  ? 'বাংলাদেশের বাড়িভাড়া ব্যবস্থা ও স্থানীয় আইনের বাস্তব উপযোগী ফিচার'
                  : 'Engineered for the realities of property management across Bangladesh'}
              </h2>
              <p className="text-sm text-[#525252]">
                {isBn
                  ? 'বিদেশি টেমপ্লেট সফটওয়্যার নয়, দেশের বিদ্যুৎ সাব-মিটার ও পুলিশ ভেরিফিকেশন নিয়মের আলোকে নির্মিত।'
                  : 'Tailored for DESCO/WASA billing structures, DMP CIMS reporting, and local MFS channels.'}
              </p>
            </div>

            {/* 4 Concrete Institutional Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pillar 1 */}
              <div className="p-6 rounded-md border border-[#E5E7EB] bg-[#FAFAF9] space-y-2.5">
                <div className="flex items-center gap-2 text-[#12664F]">
                  <Zap className="w-5 h-5 shrink-0" />
                  <h3 className="text-base font-bold text-[#171717]">
                    {isBn ? 'ডেসকো ও ওয়াসা বিদ্যুৎ-পানি বিল বণ্টন' : 'DESCO & WASA Sub-Meter Math'}
                  </h3>
                </div>
                <p className="text-sm text-[#525252] leading-relaxed">
                  {isBn
                    ? 'ডেসকো বা ডিপিডিসি সাব-মিটার ইউনিট রিডিং বসিয়ে স্বয়ংক্রিয়ভাবে স্ল্যাব রেট অনুযায়ী বিদ্যুৎ বিল এবং ফ্ল্যাটপ্রতি গ্যাস ও সার্ভিস চার্জ নির্ভুলভাবে বণ্টন করুন।'
                    : 'Calculate electrical consumption by entering individual sub-meter readings. Slabs, common lift electricity, gas, and water are divided with mathematical certainty.'}
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 rounded-md border border-[#E5E7EB] bg-[#FAFAF9] space-y-2.5">
                <div className="flex items-center gap-2 text-[#12664F]">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <h3 className="text-base font-bold text-[#171717]">
                    {isBn ? 'ডিএমপি পুলিশ ভেরিফিকেশন ও এনআইডি' : 'DMP CIMS Police Verification Export'}
                  </h3>
                </div>
                <p className="text-sm text-[#525252] leading-relaxed">
                  {isBn
                    ? 'ভাড়াটিয়া পরিবারের জাতীয় পরিচয়পত্র নম্বর, স্থায়ী ঠিকানা ও কর্মস্থলের বিবরণ সংরক্ষণ করুন। ঢাকা মেট্রোপলিটন পুলিশ (DMP) নির্ধারিত ফরম অনুযায়ী এক্সপোর্ট করুন।'
                    : 'Store tenant family NID records, permanent addresses, and employer details formatted directly for mandatory Dhaka Metropolitan Police tenant declarations.'}
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 rounded-md border border-[#E5E7EB] bg-[#FAFAF9] space-y-2.5">
                <div className="flex items-center gap-2 text-[#12664F]">
                  <CreditCard className="w-5 h-5 shrink-0" />
                  <h3 className="text-base font-bold text-[#171717]">
                    {isBn ? 'বিকাশ ও নগদ ট্রানজেকশন আইডি রিকনসাইল' : 'bKash & Nagad TrxID Reconciliation'}
                  </h3>
                </div>
                <p className="text-sm text-[#525252] leading-relaxed">
                  {isBn
                    ? 'ভাড়াটিয়াদের দেওয়া ১০ ডিজিটের বিকাশ ও নগদ TrxID মিলিয়ে নিন। ডুপ্লিকেট পেমেন্ট সাবমিশন বন্ধ হবে এবং ক্যাশ আদায়ে নির্ভুল লেজার তৈরি হবে।'
                    : 'Match 10-character TrxIDs directly against bank statements or SMS logs to prevent duplicate claims while recording manual cash receipts.'}
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-6 rounded-md border border-[#E5E7EB] bg-[#FAFAF9] space-y-2.5">
                <div className="flex items-center gap-2 text-[#12664F]">
                  <FileText className="w-5 h-5 shrink-0" />
                  <h3 className="text-base font-bold text-[#171717]">
                    {isBn ? 'অগ্রিম জামানত ও বকেয়া খতিয়ান' : 'Advance Security Deposit Accounting'}
                  </h3>
                </div>
                <p className="text-sm text-[#525252] leading-relaxed">
                  {isBn
                    ? 'ভাড়াটিয়ার ২ বা ৩ মাসের অগ্রিম জামানতের টাকা (Security Deposit) আলাদা খতিয়ানে জমা থাকবে। ফ্ল্যাট ছাড়ার সময় বকেয়া বিল কর্তন করা যাবে নিখুঁতভাবে।'
                    : 'Maintain separate ledgers for advance security deposits with clear move-out deduction tracking, protecting both landlords and tenants.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. STRUCTURED COMPARISON MATRIX (REPLACES AI 3-CARD CLICHE)               */}
        {/* ========================================================================= */}
        <section id="comparison" className="py-16 md:py-24 bg-[#FAFAF9] border-b border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto px-5">
            {/* Section Header */}
            <div className="max-w-2xl text-left mb-10 space-y-2">
              <span className="editorial-kicker text-[#12664F] block">
                {isBn ? 'তুলনামূলক পার্থক্য' : 'OPERATIONAL COMPARISON'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] font-heading tracking-tight">
                {isBn
                  ? 'কাগজের খাতার সাধারণ পদ্ধতি বনাম বাড়িভাড়ার স্বয়ংক্রিয় খতিয়ান'
                  : 'Traditional manual management vs. BariVara structured platform'}
              </h2>
            </div>

            {/* Comparison Table */}
            <div className="border border-[#E5E7EB] rounded-md bg-white overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAF9] border-b border-[#E5E7EB] text-[#525252]">
                  <tr>
                    <th className="py-3 px-4 font-semibold w-1/4">বিষয় / কার্যপদ্ধতি</th>
                    <th className="py-3 px-4 font-semibold w-3/8 text-gray-500">সনাতন খাতা ও এক্সেল পদ্ধতি</th>
                    <th className="py-3 px-4 font-bold w-3/8 text-[#12664F]">বাড়িভাড়া ক্লাউড প্ল্যাটফর্ম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-[#171717]">বিদ্যুৎ ও পানি বিল বণ্টন</td>
                    <td className="py-3.5 px-4 text-gray-500">হাতে হিসাব ও ক্যালকুলেটরে স্ল্যাব হিসেব; ভাড়াটিয়ার সাথে মতবিরোধের শঙ্কা।</td>
                    <td className="py-3.5 px-4 font-medium text-[#12664F]">সাব-মিটার রিডিং বসানোর সাথে সাথে স্বয়ংক্রিয় স্ল্যাব ভাগ ও আইটেমাইজড বিল।</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-[#171717]">ভাড়া আদায় ট্র্যাকিং</td>
                    <td className="py-3.5 px-4 text-gray-500">বিকাশ বা নগদ এসএমএস খুঁজে বের করা এবং খাতায় টিক দিয়ে রাখা।</td>
                    <td className="py-3.5 px-4 font-medium text-[#12664F]">TrxID দিয়ে পেমেন্ট ভেরিফাই এবং তাৎক্ষণিক লাইভ খতিয়ানে স্ট্যাটাস আপডেট।</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-[#171717]">মানি রিসিট প্রদান</td>
                    <td className="py-3.5 px-4 text-gray-500">কার্বন পেপার রসিদ বইয়ে হাতে লেখা ও সই করে ভাড়াটিয়ার কাছে পাঠানো।</td>
                    <td className="py-3.5 px-4 font-medium text-[#12664F]">১ ক্লিকে অফিসিয়াল স্ট্যাম্পসহ পিডিএফ মানি রিসিট সরাসরি হোয়াটসঅ্যাপে প্রেরণ।</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-[#171717]">ডিএমপি পুলিশ ফরম</td>
                    <td className="py-3.5 px-4 text-gray-500">এনআইডি ফটোকপি ও ফরম হারিয়ে যাওয়ার ঝুঁকি; খুঁজে পেতে সময় অপচয়।</td>
                    <td className="py-3.5 px-4 font-medium text-[#12664F]">ক্লাউড ডাটাবেজে স্থায়ী এনআইডি সংরক্ষণ ও ১ ক্লিকে DMP ফরম তৈরি।</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-[#171717]">দূরবর্তী প্রবেশযোগ্যতা</td>
                    <td className="py-3.5 px-4 text-gray-500">বাসায় খাতা রেখে বাইরে বা প্রবাসে থাকলে কোনো হিসাব দেখার উপায় নেই।</td>
                    <td className="py-3.5 px-4 font-medium text-[#12664F]">স্মার্টফোন বা ল্যাপটপ থেকে দেশ বা বিদেশ যেকোনো স্থান থেকে সার্বক্ষণিক অ্যাক্সেস।</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. PRE-FOOTER INVITATION: RESTRAINED, CONCRETE CALL TO ACTION             */}
        {/* ========================================================================= */}
        <section className="py-16 md:py-20 bg-[#FAFAF9] border-b border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto px-5 text-left">
            <div className="max-w-2xl space-y-4">
              <span className="editorial-kicker text-[#12664F] block">
                {isBn ? 'শুরু করার প্রস্তুতি' : 'GETTING STARTED'}
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#171717] font-heading tracking-tight">
                {isBn
                  ? 'কাগজের খাতার ঝামেলা ছাড়া বাড়ি পরিচালনা শুরু করুন'
                  : 'Start managing your properties without paper registers'}
              </h2>

              <p className="text-sm sm:text-base text-[#525252] leading-relaxed">
                {isBn
                  ? 'ব্যক্তিগত বাড়িওয়ালাদের জন্য ৪টি ফ্ল্যাট পর্যন্ত বিনামূল্যে ব্যবহারের সুযোগ। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই।'
                  : 'Free for individual landlords managing up to 4 rental units. No credit card required to set up your building registry.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-xs font-bold text-white bg-[#12664F] hover:bg-[#0E513F] transition-colors landing-focus"
                >
                  <span>{isBn ? 'বিনামূল্যে অ্যাকাউন্ট তৈরি করুন' : 'Create Free Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-md px-5 py-3 text-xs font-bold text-[#12664F] border border-[#12664F] bg-white hover:bg-gray-50 transition-colors landing-focus"
                >
                  <span>{isBn ? 'লগইন করুন' : 'Sign In to Account'}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Security and Guarantees Strip */}
        <section aria-label="Security and Technical Standards" className="py-8 bg-white border-b border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-900">
                  <Lock className="w-3.5 h-3.5 text-[#12664F]" />
                  <span>256-Bit SSL Encryption</span>
                </div>
                <div className="text-[11px] text-gray-500">এনক্রিপ্টেড ক্লাউড ডাটাবেজ</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#12664F]" />
                  <span>DMP CIMS Ready</span>
                </div>
                <div className="text-[11px] text-gray-500">পুলিশ ভেরিফিকেশন মানসম্মত</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#12664F]" />
                  <span>BDT Native Currency</span>
                </div>
                <div className="text-[11px] text-gray-500">বাংলা ও ইংরেজি ইন্টারফেস</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-900">
                  <Clock className="w-3.5 h-3.5 text-[#12664F]" />
                  <span>Continuous Cloud Backup</span>
                </div>
                <div className="text-[11px] text-gray-500">সার্বক্ষণিক ডাটা ব্যাকআপ</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 9. STRUCTURED MULTI-COLUMN FOOTER                                         */}
      {/* ========================================================================= */}
      <footer className="bg-[#0B1914] text-[#9EBAB0] pt-14 pb-10 border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-white/10">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-3">
              <Link href="#top" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md overflow-hidden border border-white/20 bg-white/10 p-1 flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="BariVara Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-white font-heading">BariVara</span>
                  <span className="text-xs font-semibold text-[#10B981] font-bengali">বাড়িভাড়া</span>
                </div>
              </Link>

              <p className="text-xs text-[#9EBAB0] leading-relaxed max-w-sm">
                {isBn
                  ? 'বাংলাদেশের বাড়িওয়ালা ও প্রপার্টি ম্যানেজারদের জন্য বাড়ি ও ভাড়া ব্যবস্থাপনা সফটওয়্যার। নির্ভুল খতিয়ান, সময়মতো ভাড়া ও মানসিক শান্তি।'
                  : 'Property and rental management software engineered specifically for residential and commercial property owners across Bangladesh.'}
              </p>

              <div className="pt-1 text-xs text-white flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>সিস্টেম সচল · ঢাকা ক্লাউড সার্ভার</span>
              </div>
            </div>

            {/* Navigation Column 1: প্রোডাক্ট */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {isBn ? 'প্রোডাক্ট' : 'Product'}
              </h4>
              <ul className="space-y-1.5 text-xs text-[#9EBAB0]">
                <li><Link href="#capabilities" className="hover:text-white transition-colors">{isBn ? 'বাড়ি ও ফ্ল্যাট রেজিস্ট্রি' : 'Property Registry'}</Link></li>
                <li><Link href="#capabilities" className="hover:text-white transition-colors">{isBn ? 'ভাড়াটিয়া চুক্তি ও এনআইডি' : 'Tenant Profiles'}</Link></li>
                <li><Link href="#capabilities" className="hover:text-white transition-colors">{isBn ? 'ইউটিলিটি বিল ক্যালকুলেটর' : 'Utility Splitting'}</Link></li>
                <li><Link href="#capabilities" className="hover:text-white transition-colors">{isBn ? 'হোয়াটসঅ্যাপ মানি রিসিট' : 'WhatsApp Receipts'}</Link></li>
                <li><Link href="#ledger" className="hover:text-white transition-colors">{isBn ? 'আর্থিক খতিয়ান ডেমো' : 'Financial Ledger'}</Link></li>
              </ul>
            </div>

            {/* Navigation Column 2: সমাধান */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {isBn ? 'সমাধান' : 'Solutions'}
              </h4>
              <ul className="space-y-1.5 text-xs text-[#9EBAB0]">
                <li><span className="hover:text-white transition-colors cursor-pointer">{isBn ? 'আবাসিক বাড়ি মালিক' : 'Residential Landlords'}</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">{isBn ? 'বাণিজ্যিক ভবন ও দোকান' : 'Commercial Buildings'}</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">{isBn ? 'প্রপার্টি ম্যানেজমেন্ট ফার্ম' : 'Property Managers'}</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">{isBn ? 'প্রবাসীদের বাড়ি পরিচালনা' : 'Non-Resident Landlords'}</span></li>
              </ul>
            </div>

            {/* Navigation Column 3: রিসোর্স ও আইনি */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {isBn ? 'আইনি ও সহায়তা' : 'Legal & Support'}
              </h4>
              <ul className="space-y-1.5 text-xs text-[#9EBAB0]">
                <li><span className="hover:text-white transition-colors cursor-pointer">{isBn ? 'ভাড়া চুক্তিপত্র ফরম্যাট' : 'Rental Agreements'}</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">{isBn ? 'ডিএমপি পুলিশ ভেরিফিকেশন' : 'Police Verification Form'}</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">{isBn ? 'বাড়িভাড়া নিয়ন্ত্রণ আইন ১৯৯১' : 'Tenancy Law 1991'}</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">{isBn ? 'সহায়তা ও যোগাযোগ' : 'Help & Support'}</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Terms */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6F8A80] gap-4">
            <div>
              © 2026 BariVara Technologies Ltd. সর্বস্বত্ব সংরক্ষিত।
            </div>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-white transition-colors">{isBn ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'}</Link>
              <Link href="#" className="hover:text-white transition-colors">{isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service'}</Link>
              <Link href="#" className="hover:text-white transition-colors">{isBn ? 'নিরাপত্তা' : 'Security'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}