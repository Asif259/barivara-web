'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguageStore, useLanguageHydrated } from '@/stores/language-store';
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
  CalendarCheck
} from 'lucide-react';

export default function LandingPage() {
  const { language, setLanguage } = useLanguageStore();
  const languageHydrated = useLanguageHydrated();
  const { isAuthenticated } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

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

  // Controlled entrance animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: (customDelay: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.55,
        delay: shouldReduceMotion ? 0 : customDelay,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  const sectionReveal = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#060807] text-[#F2F5F4] font-sans selection:bg-[#12664F] selection:text-white relative overflow-x-hidden">
      {/* Subtle Architectural Ambient Lighting */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[600px] h-[550px] landing-ambient-depth z-0 opacity-80"
        aria-hidden="true"
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#060807]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-[1160px] mx-auto px-5 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="#top" className="flex items-center gap-2.5 group landing-focus">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-white/5 p-1 flex items-center justify-center transition-colors group-hover:border-[#2DC2BD]/40">
              <Image
                src="/logo.png"
                alt="Barivara Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tracking-tight text-[#F2F5F4]">Barivara</span>
              <span className="text-xs font-medium text-[#2DC2BD] font-bengali">বাড়িভাড়া</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm text-[#9AA5A1]" aria-label="Main Navigation">
            <Link href="#features" className="hover:text-[#F2F5F4] transition-colors landing-focus py-1">
              {isBn ? 'ফিচারসমূহ' : 'Features'}
            </Link>
            <Link href="#dashboard-preview" className="hover:text-[#F2F5F4] transition-colors landing-focus py-1">
              {isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}
            </Link>
            <Link href="#how-it-works" className="hover:text-[#F2F5F4] transition-colors landing-focus py-1">
              {isBn ? 'কীভাবে কাজ করে' : 'How It Works'}
            </Link>
            <Link href="#why-barivara" className="hover:text-[#F2F5F4] transition-colors landing-focus py-1">
              {isBn ? 'সুবিধাসমূহ' : 'Why Barivara'}
            </Link>
          </nav>

          {/* Header Action Cluster */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#9AA5A1] hover:text-[#F2F5F4] border border-white/10 hover:border-white/20 bg-white/[0.03] transition-colors cursor-pointer landing-focus"
              title={isBn ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Globe className="w-3.5 h-3.5 text-[#2DC2BD]" />
              <span>{isBn ? 'EN' : 'বাংলা'}</span>
            </button>

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] hover:brightness-110 active:brightness-95 transition-all landing-focus shadow-sm"
              >
                <span>{isBn ? 'ড্যাশবোর্ডে যান' : 'Go to Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-[#9AA5A1] hover:text-[#F2F5F4] transition-colors landing-focus"
                >
                  {isBn ? 'লগইন' : 'Sign In'}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] hover:brightness-110 active:brightness-95 transition-all landing-focus shadow-sm"
                >
                  <span>{isBn ? 'শুরু করুন' : 'Get Started'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              type="button"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#9AA5A1] border border-white/10 bg-white/[0.03] landing-focus"
            >
              {isBn ? 'EN' : 'বাং'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#F2F5F4] border border-white/10 bg-white/[0.03] landing-focus"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/[0.08] bg-[#060807]/98 px-5 py-4 space-y-3">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#9AA5A1] hover:text-[#F2F5F4] py-1.5"
            >
              {isBn ? 'ফিচারসমূহ' : 'Features'}
            </Link>
            <Link
              href="#dashboard-preview"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#9AA5A1] hover:text-[#F2F5F4] py-1.5"
            >
              {isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#9AA5A1] hover:text-[#F2F5F4] py-1.5"
            >
              {isBn ? 'কীভাবে কাজ করে' : 'How It Works'}
            </Link>
            <Link
              href="#why-barivara"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#9AA5A1] hover:text-[#F2F5F4] py-1.5"
            >
              {isBn ? 'সুবিধাসমূহ' : 'Why Barivara'}
            </Link>
            <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c]"
                >
                  {isBn ? 'ড্যাশবোর্ডে যান' : 'Go to Dashboard'}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-medium text-[#9AA5A1] hover:text-[#F2F5F4]"
                  >
                    {isBn ? 'লগইন' : 'Sign In'}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c]"
                  >
                    {isBn ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন' : 'Get Started Free'}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main id="top" className="relative z-10">
        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden pt-14 md:pt-20 pb-16 md:pb-24">
          {/* Subtle Hairline Grid Backdrop */}
          <div className="pointer-events-none absolute inset-0 landing-grid-pattern z-0" aria-hidden="true" />

          {/* Bottom Gradient Fade */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#060807] z-0"
            aria-hidden="true"
          />

          <div className="max-w-[1160px] mx-auto px-5 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Headline and Actions */}
              <div className="lg:col-span-7 space-y-6">
                {/* Category Label */}
                <motion.div
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#2DC2BD] tracking-wide"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DC2BD]" />
                  <span>
                    {isBn
                      ? 'বাঙালি বাড়িওয়ালাদের জন্য স্মার্ট সমাধান'
                      : 'MODERN PROPERTY & RENT PLATFORM'}
                  </span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.08}
                  className="text-4xl sm:text-5xl lg:text-[54px] font-normal tracking-tight text-[#F2F5F4] leading-[1.12]"
                >
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
                </motion.h1>

                {/* Subtitle / Lead Paragraph */}
                <motion.p
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.16}
                  className="text-base sm:text-lg text-[#9AA5A1] max-w-xl font-normal leading-relaxed"
                >
                  {isBn
                    ? 'একাধিক বাড়ি ও ফ্ল্যাট, ভাড়া চুক্তি, ইউটিলিটি বিলসহ মাসিক ভাড়া নোটিশ, বিকাশ ও নগদ আদায় এবং তাৎক্ষণিক মানি রিসিট—সবকিছু এক প্ল্যাটফর্মে ম্যানেজ করুন।'
                    : 'Manage properties, flats, tenants, monthly rent notices, bKash & cash collections, and instant digital payment receipts from one unified, stress-free dashboard.'}
                </motion.p>

                {/* Action CTAs */}
                <motion.div
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.24}
                  className="flex flex-wrap items-center gap-3.5 pt-1"
                >
                  <Link
                    href={isAuthenticated ? '/dashboard' : '/register'}
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] hover:brightness-110 active:brightness-95 transition-all shadow-sm landing-focus"
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
                    className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-[#F2F5F4] border border-white/15 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.05] transition-all landing-focus"
                  >
                    <span>{isBn ? 'ফিচারসমূহ দেখুন' : 'Explore Features'}</span>
                  </Link>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.32}
                  className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#9AA5A1]"
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2DC2BD]" />
                    <span>{isBn ? 'বাংলা ও ইংরেজি সাপোর্ট' : 'Bangla & English'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2DC2BD]" />
                    <span>{isBn ? 'বিকাশ ও নগদ হিসাব' : 'bKash, Nagad & Cash'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2DC2BD]" />
                    <span>{isBn ? 'প্রিন্টযোগ্য মানি রিসিট' : 'Printable Receipts'}</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Grounded Architectural Stage & Status Cards */}
              <motion.div
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                custom={0.18}
                className="lg:col-span-5 relative"
              >
                <div className="relative aspect-square w-full max-w-[480px] mx-auto flex items-center justify-center">
                  {/* Architectural Building Graphic */}
                  <svg
                    className="absolute inset-[6%_10%_0] w-[80%] h-[92%] opacity-85"
                    viewBox="0 0 300 380"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="heroBldGradRefined" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#2DC2BD" stopOpacity="0.20" />
                        <stop offset="1" stopColor="#12664F" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M40 380V120l90-40v60l70-30v270z"
                      fill="url(#heroBldGradRefined)"
                      stroke="rgba(45,194,189,0.3)"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M200 380V110l60 24v246z"
                      fill="url(#heroBldGradRefined)"
                      stroke="rgba(45,194,189,0.22)"
                      strokeWidth="1.2"
                    />
                    <g fill="#2DC2BD" opacity="0.6">
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

                  {/* Card 1: Monthly Rent (Top Left) */}
                  <div
                    className="absolute top-[5%] left-[2%] w-[58%] border border-white/10 rounded-xl p-4 bg-[#0A0F0D]/90 backdrop-blur-md shadow-lg text-left"
                    role="region"
                    aria-label="Unit Monthly Rent sample card"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <small className="text-[#9AA5A1] text-xs font-normal">
                        {isBn ? 'মাসিক ভাড়া · ফ্ল্যাট ৪বি' : 'Monthly Rent · Unit 4B'}
                      </small>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2DC2BD]" />
                    </div>
                    <b className="block text-2xl font-light text-[#F2F5F4] tracking-tight">৳25,000</b>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-block text-[10px] font-medium text-[#2DC2BD] bg-[#12664F]/30 border border-[#2DC2BD]/20 rounded-md px-2 py-0.5">
                        {isBn ? 'ভাড়া হয়েছে · ৫ তারিখ দেয়' : 'Occupied · Due 5th Nov'}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Payment Status (Middle Right) */}
                  <div
                    className="absolute top-[37%] right-0 w-[54%] border border-white/10 rounded-xl p-4 bg-[#0A0F0D]/90 backdrop-blur-md shadow-lg text-left"
                    role="region"
                    aria-label="Payment status sample card"
                  >
                    <small className="block text-[#9AA5A1] text-xs font-normal mb-1">
                      {isBn ? 'পেমেন্ট অবস্থা · বিকাশ' : 'Payment Status · bKash'}
                    </small>
                    <b className="block text-lg font-normal text-[#F2F5F4] tracking-tight">
                      {isBn ? 'আংশিক পরিশোধ' : 'Partial Paid'}
                    </b>
                    <div className="mt-2 text-[10px] text-[#2DC2BD] bg-[#12664F]/30 border border-[#2DC2BD]/20 rounded-md px-2 py-0.5 inline-block">
                      {isBn ? '৳১৫,০০০ প্রাপ্ত (বকেয়া ৳১০,০০০)' : '৳15,000 paid · ৳10,000 due'}
                    </div>
                  </div>

                  {/* Card 3: Monthly Collection (Bottom Left) */}
                  <div
                    className="absolute bottom-[5%] left-[8%] w-[64%] border border-white/10 rounded-xl p-4 bg-[#0A0F0D]/90 backdrop-blur-md shadow-lg text-left"
                    role="region"
                    aria-label="Monthly rental income sample card"
                  >
                    <small className="block text-[#9AA5A1] text-xs font-normal mb-1">
                      {isBn ? 'নভেম্বর ভাড়া আদায়' : 'Monthly Rental Income'}
                    </small>
                    <b className="block text-2xl font-light text-[#F2F5F4] tracking-tight">৳184,000</b>

                    {/* Sparkline mini-bars */}
                    <div className="flex items-end gap-1.5 h-7 mt-2" aria-hidden="true">
                      <div className="flex-1 bg-[#2DC2BD]/70 rounded-t-[2px] h-[55%]" />
                      <div className="flex-1 bg-[#7A82AB]/70 rounded-t-[2px] h-[70%]" />
                      <div className="flex-1 bg-[#2DC2BD]/70 rounded-t-[2px] h-[62%]" />
                      <div className="flex-1 bg-[#7A82AB]/70 rounded-t-[2px] h-[80%]" />
                      <div className="flex-1 bg-[#2DC2BD]/70 rounded-t-[2px] h-[74%]" />
                      <div className="flex-1 bg-[#2DC2BD] rounded-t-[2px] h-[92%]" />
                    </div>
                    <div className="mt-2 text-[10px] text-[#C6D4FF] flex justify-between">
                      <span>{isBn ? 'আদায়ের হার' : 'Collection Rate'}</span>
                      <span className="font-semibold text-[#2DC2BD]">92%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE DASHBOARD PREVIEW SECTION                                    */}
        {/* ========================================================================= */}
        <motion.section
          id="dashboard-preview"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="py-16 md:py-20 border-t border-white/[0.08] relative"
        >
          <div className="max-w-[1160px] mx-auto px-5">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-semibold tracking-wider text-[#2DC2BD] uppercase block mb-2">
                {isBn ? 'সেন্ট্রাল ড্যাশবোর্ড' : 'CENTRAL DASHBOARD'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#F2F5F4]">
                {isBn ? 'সব বাড়ির সম্পূর্ণ হিসাব এক ড্যাশবোর্ডে।' : 'One dashboard for every property.'}
              </h2>
              <p className="text-sm sm:text-base text-[#9AA5A1] mt-2.5">
                {isBn
                  ? 'বাড়ি ও ফ্ল্যাটের বর্তমান অবস্থা, চলতি মাসের ভাড়া আদায় ও বকেয়ার বিবরণী সহজে মনিটর করুন।'
                  : 'Real-time visibility over occupied units, monthly rent collections, utility costs, and overdue balances.'}
              </p>
            </div>

            {/* Dashboard Mock Shell */}
            <div className="border border-white/[0.08] rounded-2xl bg-[#080C0A] overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12">
              {/* Mock Sidebar */}
              <div className="hidden md:block md:col-span-3 border-r border-white/[0.08] p-4 space-y-1 bg-[#060907]">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#F2F5F4] mb-2">
                  <Building2 className="w-4 h-4 text-[#2DC2BD]" />
                  <span>BariVara Control</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#12664F]/30 text-[#F2F5F4] font-medium border border-[#12664F]/40">
                    <Home className="w-3.5 h-3.5 text-[#2DC2BD]" />
                    <span>{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9AA5A1]">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isBn ? 'বাড়ি ও ফ্ল্যাট' : 'Properties & Units'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9AA5A1]">
                    <Users className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ভাড়াটিয়া' : 'Tenants'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9AA5A1]">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ভাড়া চুক্তি' : 'Agreements'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9AA5A1]">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>{isBn ? 'মাসিক ভাড়া ও বিল' : 'Monthly Rents'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9AA5A1]">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{isBn ? 'পেমেন্ট ও আদায়' : 'Payments'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9AA5A1]">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{isBn ? 'খরচাপাতি' : 'Expenses'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9AA5A1]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{isBn ? 'প্রতিবেদন' : 'Reports'}</span>
                  </div>
                </div>
              </div>

              {/* Mock Main Dashboard Body */}
              <div className="md:col-span-9 p-5 lg:p-7 space-y-5">
                {/* Header Tabs inside dashboard */}
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className={`px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        activeTab === 'overview'
                          ? 'border-[#2DC2BD]/40 bg-[#12664F]/30 text-[#F2F5F4] font-medium'
                          : 'border-white/10 text-[#9AA5A1] hover:text-[#F2F5F4]'
                      }`}
                    >
                      {isBn ? 'সারসংক্ষেপ' : 'Overview'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('rents')}
                      className={`px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        activeTab === 'rents'
                          ? 'border-[#2DC2BD]/40 bg-[#12664F]/30 text-[#F2F5F4] font-medium'
                          : 'border-white/10 text-[#9AA5A1] hover:text-[#F2F5F4]'
                      }`}
                    >
                      {isBn ? 'ভাড়া আদায় বিশ্লেষণ' : 'Rent Analysis'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('units')}
                      className={`px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        activeTab === 'units'
                          ? 'border-[#2DC2BD]/40 bg-[#12664F]/30 text-[#F2F5F4] font-medium'
                          : 'border-white/10 text-[#9AA5A1] hover:text-[#F2F5F4]'
                      }`}
                    >
                      {isBn ? 'ফ্ল্যাট ও ভাড়াটিয়া' : 'Units & Tenants'}
                    </button>
                  </div>

                  <span className="text-xs text-[#2DC2BD] bg-[#12664F]/20 border border-[#2DC2BD]/20 px-2.5 py-0.5 rounded-md">
                    {isBn ? 'নভেম্বর ২০২৬' : 'November 2026'}
                  </span>
                </div>

                {/* Main Top Chart Box & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Monthly Collection Chart */}
                  <div className="lg:col-span-2 border border-white/[0.08] rounded-xl p-4 bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <small className="text-xs text-[#9AA5A1] block">
                          {isBn ? 'চলতি মাসে আদায়কৃত ভাড়া' : 'Rent Collected · Current Month'}
                        </small>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-light tracking-tight text-[#F2F5F4]">৳184,000</span>
                          <span className="text-xs text-[#2DC2BD] font-medium">▲ +12% {isBn ? 'বৃদ্ধি' : 'vs avg'}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <small className="text-[#9AA5A1] block">{isBn ? 'বকেয়া' : 'Due'}</small>
                        <span className="text-sm font-medium text-[#C6D4FF]">৳36,000</span>
                      </div>
                    </div>

                    {/* Interactive Bar Chart */}
                    <div className="mt-5">
                      <div className="flex items-end gap-3 sm:gap-4 h-36 pt-3 pb-1">
                        {monthsData.map((m, idx) => (
                          <div
                            key={m.name}
                            className="flex-1 flex items-end gap-1 h-full group relative cursor-pointer"
                            onMouseEnter={() => setHoveredMonthIndex(idx)}
                            onMouseLeave={() => setHoveredMonthIndex(null)}
                          >
                            {/* Hover Tooltip */}
                            {hoveredMonthIndex === idx && (
                              <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-20 bg-[#0A0F0D] border border-white/20 rounded-md p-1.5 text-[10px] text-white shadow-xl whitespace-nowrap pointer-events-none">
                                <div className="font-semibold text-[#2DC2BD]">{m.name}</div>
                                <div>{isBn ? 'আদায়' : 'Paid'}: {formatBDT(m.collected)}</div>
                                <div className="text-[#C6D4FF]">{isBn ? 'বকেয়া' : 'Due'}: {formatBDT(m.outstanding)}</div>
                              </div>
                            )}

                            {/* Collected Bar */}
                            <div
                              className="flex-1 rounded-t-sm bg-gradient-to-t from-[#12664F] to-[#2DC2BD] transition-all duration-200 group-hover:brightness-110"
                              style={{ height: `${m.collectedPct}%` }}
                            />
                            {/* Outstanding Bar */}
                            <div
                              className="flex-1 rounded-t-sm bg-[#7A82AB]/70 transition-all duration-200 group-hover:brightness-110"
                              style={{ height: `${m.outstandingPct * 2}%` }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Month Labels & Legend */}
                      <div className="flex justify-between text-[11px] text-[#9AA5A1] border-t border-white/[0.06] pt-1.5">
                        {monthsData.map((m) => (
                          <span key={m.name} className="flex-1 text-center font-medium">
                            {m.name}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-center gap-5 mt-2.5 text-xs text-[#9AA5A1]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#2DC2BD]" />
                          <span>{isBn ? 'সংগৃহীত ভাড়া' : 'Collected Rent'}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#7A82AB]" />
                          <span>{isBn ? 'বকেয়া' : 'Outstanding Balance'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Shortcuts */}
                  <div className="border border-white/[0.08] rounded-xl p-4 bg-white/[0.02] flex flex-col justify-between">
                    <div>
                      <small className="text-xs text-[#9AA5A1] block mb-2.5">
                        {isBn ? 'দ্রুত অ্যাকশন' : 'Quick Actions'}
                      </small>
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex items-center justify-between text-xs text-[#F2F5F4] cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-[#2DC2BD]" />
                            <span>{isBn ? 'নতুন বাড়ি যুক্ত করুন' : 'Add Property'}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#9AA5A1]" />
                        </div>

                        <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex items-center justify-between text-xs text-[#F2F5F4] cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-[#2DC2BD]" />
                            <span>{isBn ? 'ভাড়াটিয়া ও চুক্তি যুক্ত' : 'Register Tenant'}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#9AA5A1]" />
                        </div>

                        <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex items-center justify-between text-xs text-[#F2F5F4] cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Receipt className="w-3.5 h-3.5 text-[#2DC2BD]" />
                            <span>{isBn ? 'পেমেন্ট ও মানি রিসিট' : 'Record Payment'}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#9AA5A1]" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] text-[11px] text-[#9AA5A1]">
                      <span>{isBn ? 'বিকাশ ও নগদে সংগৃহীত:' : 'bKash/Nagad collections:'} </span>
                      <span className="text-[#2DC2BD] font-medium">৳132,000</span>
                    </div>
                  </div>
                </div>

                {/* KPI Summary Tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="border border-white/[0.08] rounded-xl p-3.5 bg-white/[0.02]">
                    <small className="text-xs text-[#9AA5A1] block">{isBn ? 'মোট প্রপার্টি' : 'Properties'}</small>
                    <b className="block text-xl font-light text-[#F2F5F4] mt-0.5">6</b>
                    <span className="text-[11px] text-[#9AA5A1] block mt-0.5">
                      {isBn ? '২৪টি ফ্ল্যাট / ইউনিট' : '24 Total Units'}
                    </span>
                  </div>

                  <div className="border border-white/[0.08] rounded-xl p-3.5 bg-white/[0.02]">
                    <small className="text-xs text-[#9AA5A1] block">{isBn ? 'বর্তমান ভাড়াটিয়া' : 'Active Tenants'}</small>
                    <b className="block text-xl font-light text-[#F2F5F4] mt-0.5">22</b>
                    <span className="text-[11px] text-[#2DC2BD] block mt-0.5">
                      {isBn ? '৯২% ফ্ল্যাট ভাড়া হয়েছে' : '92% Occupied'}
                    </span>
                  </div>

                  <div className="border border-white/[0.08] rounded-xl p-3.5 bg-white/[0.02]">
                    <small className="text-xs text-[#9AA5A1] block">{isBn ? 'আদায়কৃত ভাড়া' : 'Rent Collected'}</small>
                    <b className="block text-xl font-light text-[#2DC2BD] mt-0.5">৳184,000</b>
                    <span className="text-[11px] text-[#9AA5A1] block mt-0.5">
                      {isBn ? 'নভেম্বর ২০২৬' : 'November 2026'}
                    </span>
                  </div>

                  <div className="border border-white/[0.08] rounded-xl p-3.5 bg-white/[0.02]">
                    <small className="text-xs text-[#9AA5A1] block">{isBn ? 'বকেয়া পাওনা' : 'Outstanding Balance'}</small>
                    <b className="block text-xl font-light text-[#C6D4FF] mt-0.5">৳36,000</b>
                    <span className="text-[11px] text-[#9AA5A1] block mt-0.5">
                      {isBn ? '২টি ফ্ল্যাটের বকেয়া' : '2 Units Overdue'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-[#9AA5A1]/70 mt-4">
              {isBn
                ? 'ড্যাশবোর্ড প্রিভিউতে প্রদর্শিত তথ্য অ্যাপ্লিকেশনের লাইভ কার্যপদ্ধতি নির্দেশ করে।'
                : 'Dashboard preview represents live platform structure with sample property figures.'}
            </p>
          </div>
        </motion.section>

        {/* ========================================================================= */}
        {/* CORE FEATURES DEEP DIVE (ALTERNATING PANELS)                             */}
        {/* ========================================================================= */}
        <section id="features" className="py-16 md:py-20 border-t border-white/[0.08]">
          <div className="max-w-[1160px] mx-auto px-5 space-y-10">
            {/* Panel 1: Properties & Units */}
            <motion.div
              variants={sectionReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              className="bg-[#0A0F0D] border border-white/[0.08] rounded-2xl p-7 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              <div className="space-y-4">
                <span className="text-xs font-semibold tracking-wider text-[#2DC2BD] uppercase block">
                  {isBn ? 'বাড়ি ও ফ্ল্যাট ব্যবস্থাপনা' : 'PROPERTIES & UNITS'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#F2F5F4] leading-tight">
                  {isBn ? 'প্রতিটি বাড়ি ও ফ্ল্যাট, সুবিন্যস্ত এক নজরে।' : 'Every Property, Floor & Unit, Perfectly Organized.'}
                </h2>
                <p className="text-sm sm:text-base text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'মিরপুর, ধানমন্ডি বা গুলশান—যেখানেই বাড়ি থাকুক না কেন, সকল ফ্ল্যাট, শপ ও রুমের তথ্য খাতায় না লিখে ক্লাউডে গুছিয়ে রাখুন। খালি ও ভাড়া ফ্ল্যাটের সঠিক হিসাব থাকবে সবসময়।'
                    : 'Manage multi-story buildings, residential flats, commercial shops, and vacancy status across Dhaka and beyond. Replace handwritten diaries with cloud precision.'}
                </p>

                <ul className="space-y-2.5 pt-1 text-sm text-[#F2F5F4]">
                  <li className="flex items-start gap-2.5 landing-check-icon">
                    <span>
                      {isBn
                        ? 'রিয়েল-টাইম ভাড়া অবস্থা (ভাড়া হয়েছে, খালি আছে বা মেরামত চলছে)'
                        : 'Live occupancy tracking (Occupied, Available, Under Maintenance)'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 landing-check-icon">
                    <span>
                      {isBn
                        ? 'ফ্ল্যাটের বিবরণ—বেডরুম, বাথরুম, ভাড়া এবং আলাদা মিটার নম্বর'
                        : 'Floor-by-floor unit specs: bedrooms, bathrooms, rent rates, and meter numbers'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 landing-check-icon">
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
                    className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] hover:brightness-110 active:brightness-95 transition-all shadow-sm landing-focus"
                  >
                    <span>{isBn ? 'শুরু করুন' : 'Get Started'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual: Stacked Property Cards */}
              <div className="relative min-h-[280px] flex items-center justify-center">
                <div className="relative w-full max-w-[340px] h-[260px]">
                  {/* Card 1 */}
                  <div className="absolute top-0 left-0 w-[80%] border border-white/10 rounded-xl p-4 bg-[#12664F]/40 backdrop-blur-md shadow-md z-10 landing-card-interactive">
                    <span className="text-xs text-[#B4BEBA] block">{isBn ? 'মিরপুর টাওয়ার · ফ্ল্যাট ২এ' : 'Mirpur Tower · Unit 2A'}</span>
                    <b className="block text-lg font-normal text-[#F2F5F4] mt-1">৳18,000 / {isBn ? 'মাস' : 'mo'}</b>
                    <div className="mt-1.5 text-[10px] text-[#2DC2BD] bg-[#2DC2BD]/15 border border-[#2DC2BD]/20 rounded-md px-2 py-0.5 inline-block">
                      {isBn ? 'ভাড়া হয়েছে · পরিবার' : 'Occupied · 3 Bed, 2 Bath'}
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="absolute top-[28%] left-[14%] w-[80%] border border-white/10 rounded-xl p-4 bg-[#307473]/45 backdrop-blur-md shadow-md z-20 landing-card-interactive">
                    <span className="text-xs text-[#B4BEBA] block">{isBn ? 'ধানমন্ডি লেকভিউ · ফ্ল্যাট ৪বি' : 'Dhanmondi Lakeview · Unit 4B'}</span>
                    <b className="block text-lg font-normal text-[#F2F5F4] mt-1">৳25,000 / {isBn ? 'মাস' : 'mo'}</b>
                    <div className="mt-1.5 text-[10px] text-[#2DC2BD] bg-[#2DC2BD]/15 border border-[#2DC2BD]/20 rounded-md px-2 py-0.5 inline-block">
                      {isBn ? 'ভাড়া হয়েছে · ৫ নভেম্বর দেয়' : 'Occupied · Due Nov 5th'}
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="absolute top-[56%] left-[28%] w-[80%] border border-white/10 rounded-xl p-4 bg-[#7A82AB]/30 backdrop-blur-md shadow-md z-30 landing-card-interactive">
                    <span className="text-xs text-[#B4BEBA] block">{isBn ? 'বনানী হাইটস · ফ্ল্যাট ৫সি' : 'Banani Heights · Unit 5C'}</span>
                    <b className="block text-lg font-normal text-[#F2F5F4] mt-1">৳32,000 / {isBn ? 'মাস' : 'mo'}</b>
                    <div className="mt-1.5 text-[10px] text-[#C6D4FF] bg-[#C6D4FF]/15 border border-[#C6D4FF]/20 rounded-md px-2 py-0.5 inline-block">
                      {isBn ? 'খালি আছে · রেডি টু রেন্ট' : 'Vacant · Ready to Rent'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Panel 2: Monthly Rents & Utilities [Flipped Layout] */}
            <motion.div
              variants={sectionReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              className="bg-[#0A0F0D] border border-white/[0.08] rounded-2xl p-7 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              {/* Visual: Grouped Chart */}
              <div className="order-2 lg:order-1">
                <div className="border border-white/[0.08] rounded-xl p-5 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-3">
                    <small className="text-xs text-[#9AA5A1]">
                      {isBn ? 'সংগৃহীত বনাম বকেয়া ভাড়া (৬ মাস)' : 'Collected vs Outstanding Rent (6 Months)'}
                    </small>
                    <span className="text-xs text-[#2DC2BD] font-medium">
                      {isBn ? 'গড় আদায়: ৮৮%' : '88% Avg Collection'}
                    </span>
                  </div>

                  {/* Chart Bars */}
                  <div className="flex items-end gap-2.5 h-40 pt-3 pb-1">
                    {monthsData.map((m) => (
                      <div key={m.name} className="flex-1 flex items-end gap-1 h-full">
                        <div
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-[#12664F] to-[#2DC2BD]"
                          style={{ height: `${m.collectedPct}%` }}
                        />
                        <div
                          className="flex-1 rounded-t-sm bg-[#7A82AB]/70"
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

                  <div className="flex items-center justify-center gap-5 mt-3 text-xs">
                    <span className="flex items-center gap-1.5 text-[#2DC2BD]">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#2DC2BD]" />
                      <span>{isBn ? 'আদায়কৃত' : 'Collected'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[#7A82AB]">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#7A82AB]" />
                      <span>{isBn ? 'বকেয়া' : 'Outstanding'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Information */}
              <div className="space-y-4 order-1 lg:order-2">
                <span className="text-xs font-semibold tracking-wider text-[#2DC2BD] uppercase block">
                  {isBn ? 'মাসিক ভাড়া ও ইউটিলিটি বিল' : 'RENT & UTILITY BILLING'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#F2F5F4] leading-tight">
                  {isBn
                    ? 'ইউটিলিটি বিলসহ মাসিক ভাড়ার নির্ভুল হিসাব।'
                    : "Know What's Paid. Know What's Pending."}
                </h2>
                <p className="text-sm sm:text-base text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'মূল ভাড়া, বিদ্যুৎ বিল (ডেসকো/ডিপিডিসি সাবমিটার), ওয়াসা পানি, গ্যাস, জেনারেটর এবং সার্ভিস চার্জ—প্রতিটি খাতের হিসাব পরিষ্কার থাকবে। মাসের শুরুতে ১-ক্লিকেই ভাড়া তৈরি করুন।'
                    : 'Eliminate calculation disputes. Generate monthly rent records with itemized utility splits for electricity, gas, water, parking, and building service charges.'}
                </p>

                <ul className="space-y-2.5 pt-1 text-sm text-[#F2F5F4]">
                  <li className="flex items-start gap-2.5 landing-check-icon">
                    <span>
                      {isBn
                        ? '১ ক্লিকে মাসের ভাড়া জেনারেট (১ম থেকে ১০ম তারিখের স্যালারি সাইকেল অনুসারে)'
                        : 'One-click monthly billing aligned with Bangladesh salary cycles (1st to 10th)'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 landing-check-icon">
                    <span>
                      {isBn
                        ? 'আংশিক পেমেন্ট ও বকেয়ার স্বয়ংক্রিয় ট্র্যাকিং'
                        : 'Partial payments tracking with instant remaining balance calculation'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 landing-check-icon">
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
                    className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] hover:brightness-110 active:brightness-95 transition-all shadow-sm landing-focus"
                  >
                    <span>{isBn ? 'শুরু করুন' : 'Get Started'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Panel 3: Rent Notices & Digital Receipts */}
            <motion.div
              variants={sectionReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              className="bg-[#0A0F0D] border border-white/[0.08] rounded-2xl p-7 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              <div className="space-y-4">
                <span className="text-xs font-semibold tracking-wider text-[#2DC2BD] uppercase block">
                  {isBn ? 'ভাড়া নোটিশ ও ডিজিটাল রশিদ' : 'NOTICES AND RECEIPTS'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#F2F5F4] leading-tight">
                  {isBn ? 'স্বচ্ছ হিসাব। কোনো ভুল বোঝাবুঝি নেই।' : 'Clear Records. Zero Disputes. Instant Receipts.'}
                </h2>
                <p className="text-sm sm:text-base text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'ভাড়া পরিশোধের পূর্বে ভাড়াটিয়াকে দিন প্রাতিষ্ঠানিক "ভাড়া নোটিশ"। আর টাকা পাওয়ার সাথে সাথেই বিকাশ, নগদ বা ব্যাংকের জন্য দিন ডিজিটাল "মানি রিসিট", যা হোয়াটসঅ্যাপ বা প্রিন্টে দেওয়া যায়।'
                    : 'A rent notice is the transparent request issued before payment. A payment receipt is the verifiable proof issued right after, building lasting trust with tenants.'}
                </p>

                <ul className="space-y-2.5 pt-1 text-sm text-[#F2F5F4]">
                  <li className="flex items-start gap-2.5 landing-check-icon">
                    <span>
                      {isBn
                        ? 'মাসের শুরুতে স্বয়ংক্রিয় মাসিক ভাড়া নোটিশ'
                        : 'Official monthly rent notices with utility breakdown for tenants'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 landing-check-icon">
                    <span>
                      {isBn
                        ? 'টাকা জমার পর তাৎক্ষণিক প্রিন্টযোগ্য বা শেয়ারযোগ্য মানি রিসিট'
                        : 'Instant printable & WhatsApp-ready payment receipts with unique voucher IDs'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 landing-check-icon">
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
                    className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] hover:brightness-110 active:brightness-95 transition-all shadow-sm landing-focus"
                  >
                    <span>{isBn ? 'শুরু করুন' : 'Get Started'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual: Rent Notice & Receipt Mockups */}
              <div className="relative min-h-[300px] flex items-center justify-center">
                <div className="relative w-full max-w-[360px] h-[280px]">
                  {/* Rent Notice Card */}
                  <div className="absolute top-0 left-0 w-[80%] bg-[#0F1512] border border-white/10 rounded-xl p-4 text-xs text-[#B4BEBA] shadow-md landing-card-interactive">
                    <div className="flex items-center justify-between mb-2.5 border-b border-white/[0.08] pb-1.5">
                      <h3 className="text-sm font-medium text-[#F2F5F4]">
                        {isBn ? 'ভাড়া নোটিশ' : 'Rent Notice'}
                      </h3>
                      <span className="text-[10px] text-[#2DC2BD] bg-[#12664F]/20 border border-[#2DC2BD]/20 rounded-md px-1.5 py-0.5">
                        {isBn ? 'অপেক্ষমাণ' : 'Awaiting Payment'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between py-0.5 border-t border-white/[0.04]">
                        <span>{isBn ? 'ফ্ল্যাট / ইউনিট' : 'Unit'}</span>
                        <b className="text-[#F2F5F4] font-medium">4B (Dhanmondi)</b>
                      </div>
                      <div className="flex justify-between py-0.5 border-t border-white/[0.04]">
                        <span>{isBn ? 'মাস' : 'Month'}</span>
                        <b className="text-[#F2F5F4] font-medium">{isBn ? 'নভেম্বর ২০২৬' : 'November 2026'}</b>
                      </div>
                      <div className="flex justify-between py-0.5 border-t border-white/[0.04]">
                        <span>{isBn ? 'মূল ভাড়া + বিল' : 'Rent + Utilities'}</span>
                        <b className="text-[#F2F5F4] font-medium">৳22,000 + ৳3,000</b>
                      </div>
                      <div className="flex justify-between py-0.5 border-t border-white/[0.04] text-[#2DC2BD]">
                        <span className="font-medium">{isBn ? 'সর্বমোট দেয়' : 'Total Due'}</span>
                        <b className="font-semibold text-xs">৳25,000</b>
                      </div>
                    </div>
                  </div>

                  {/* Payment Receipt Card */}
                  <div className="absolute bottom-0 right-0 w-[80%] bg-[#0D1814] border border-[#2DC2BD]/30 rounded-xl p-4 text-xs text-[#B4BEBA] shadow-md z-10 landing-card-interactive">
                    <div className="flex items-center justify-between mb-2.5 border-b border-white/[0.08] pb-1.5">
                      <h3 className="text-sm font-medium text-[#F2F5F4]">
                        {isBn ? 'মানি রিসিট' : 'Payment Receipt'}
                      </h3>
                      <span className="text-[10px] text-[#2DC2BD] bg-[#12664F]/30 border border-[#2DC2BD]/30 rounded-md px-1.5 py-0.5 font-medium">
                        ✓ {isBn ? 'পরিশোধিত' : 'Paid & Verified'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between py-0.5 border-t border-white/[0.04]">
                        <span>{isBn ? 'ভাউচার নং' : 'Voucher #'}</span>
                        <b className="text-[#F2F5F4] font-mono text-[11px]">BV-2026-1104</b>
                      </div>
                      <div className="flex justify-between py-0.5 border-t border-white/[0.04]">
                        <span>{isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}</span>
                        <b className="text-[#F2F5F4] font-medium">bKash (MFS)</b>
                      </div>
                      <div className="flex justify-between py-0.5 border-t border-white/[0.04]">
                        <span>{isBn ? 'পরিশোধিত অর্থ' : 'Amount Paid'}</span>
                        <b className="text-[#2DC2BD] font-semibold text-xs">৳25,000</b>
                      </div>
                      <div className="flex justify-between py-0.5 border-t border-white/[0.04]">
                        <span>{isBn ? 'বর্তমান বকেয়া' : 'Remaining Balance'}</span>
                        <b className="text-[#F2F5F4] font-medium">৳0</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Panel 4: Expenses & Net Financials [Flipped Layout] */}
            <motion.div
              variants={sectionReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              className="bg-[#0A0F0D] border border-white/[0.08] rounded-2xl p-7 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              {/* Visual: Net Financials Card with SVG Wave */}
              <div className="order-2 lg:order-1">
                <div className="border border-white/[0.08] rounded-xl p-5 bg-white/[0.02]">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <small className="text-xs text-[#9AA5A1] block">{isBn ? 'মোট আদায়' : 'Total Revenue'}</small>
                      <b className="text-lg font-light text-[#2DC2BD] block mt-0.5">৳184,000</b>
                    </div>
                    <div>
                      <small className="text-xs text-[#9AA5A1] block">{isBn ? 'বাড়ি খরচাপাতি' : 'Expenses'}</small>
                      <b className="text-lg font-light text-[#C6D4FF] block mt-0.5">৳28,500</b>
                    </div>
                    <div>
                      <small className="text-xs text-[#9AA5A1] block">{isBn ? 'প্রকৃত লাভ' : 'Net Income'}</small>
                      <b className="text-lg font-light text-[#F2F5F4] block mt-0.5">৳155,500</b>
                    </div>
                  </div>

                  {/* SVG Trend Wave */}
                  <div className="relative pt-1">
                    <svg
                      viewBox="0 0 300 110"
                      className="w-full h-24 overflow-visible"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="finAreaGradRefined" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#2DC2BD" stopOpacity="0.3" />
                          <stop offset="1" stopColor="#12664F" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 80C40 70 60 50 100 56S170 30 210 34 270 15 300 10V110H0z"
                        fill="url(#finAreaGradRefined)"
                      />
                      <path
                        d="M0 80C40 70 60 50 100 56S170 30 210 34 270 15 300 10"
                        fill="none"
                        stroke="#2DC2BD"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="300" cy="10" r="3.5" fill="#2DC2BD" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#9AA5A1] mt-2 pt-2.5 border-t border-white/[0.06]">
                    <span>{isBn ? 'দারোয়ান, পরিচ্ছন্নতাকর্মী ও মেরামত খরচ অন্তর্ভুক্ত' : 'Includes security, cleaner & maintenance'}</span>
                    <span className="text-[#2DC2BD] font-medium">+12% {isBn ? 'মুনাফা বৃদ্ধি' : 'Net growth'}</span>
                  </div>
                </div>
              </div>

              {/* Text Information */}
              <div className="space-y-4 order-1 lg:order-2">
                <span className="text-xs font-semibold tracking-wider text-[#2DC2BD] uppercase block">
                  {isBn ? 'আয় ও ব্যয়ের আর্থিক প্রতিবেদন' : 'FINANCIAL OVERVIEW & EXPENSES'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#F2F5F4] leading-tight">
                  {isBn
                    ? 'বাড়ি রক্ষণাবেক্ষণ খরচ ও প্রকৃত লাভের হিসাব।'
                    : 'Track Building Expenses. See Your True Net Income.'}
                </h2>
                <p className="text-sm sm:text-base text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'দারোয়ান ও ঝাড়ুদারের বেতন, লিফট সার্ভিসিং, হোল্ডিং ট্যাক্স এবং সার্বিক মেরামত খরচ এন্ট্রি রাখুন। মাস শেষে বাড়ি থেকে প্রকৃতপক্ষে কত টাকা আয় হলো তা নিখুঁতভাবে দেখুন।'
                    : 'Track building maintenance, guard and cleaner salaries, lift repairs, and municipal taxes. See exactly how much your properties actually earn each month.'}
                </p>

                <ul className="space-y-2.5 pt-1 text-sm text-[#F2F5F4]">
                  <li className="flex items-start gap-2.5 landing-check-icon">
                    <span>
                      {isBn
                        ? 'খাতভিত্তিক খরচ ট্র্যাকিং (রক্ষণাবেক্ষণ, বেতন, বিদ্যুৎ বিল ও ট্যাক্স)'
                        : 'Categorized expense tracking (Maintenance, Staff, Generator, Taxes)'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 landing-check-icon">
                    <span>
                      {isBn
                        ? 'নেট অপারেটিং ইনকাম (মোট আদায়কৃত ভাড়া - বাড়ি খরচ)'
                        : 'Real-time Net Operating Income (Total Collections - Property Expenses)'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 landing-check-icon">
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
                    className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] hover:brightness-110 active:brightness-95 transition-all shadow-sm landing-focus"
                  >
                    <span>{isBn ? 'শুরু করুন' : 'Get Started'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HOW IT WORKS (FOUR PROGRESSIVE STEPS)                                    */}
        {/* ========================================================================= */}
        <motion.section
          id="how-it-works"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="py-16 md:py-20 border-t border-white/[0.08]"
        >
          <div className="max-w-[1160px] mx-auto px-5">
            <div className="max-w-xl mb-12">
              <span className="text-xs font-semibold tracking-wider text-[#2DC2BD] uppercase block mb-2">
                {isBn ? 'কার্যপদ্ধতি' : 'HOW IT WORKS'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#F2F5F4]">
                {isBn
                  ? 'সহজ চার ধাপে সম্পূর্ণ ভাড়া ব্যবস্থাপনা।'
                  : 'Four simple steps from setup to peace of mind.'}
              </h2>
            </div>

            {/* Steps Sequence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0A0F0D] hover:border-white/15 transition-colors">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-[#2DC2BD] bg-[#12664F]/30 border border-[#2DC2BD]/20 mb-4">
                  01
                </div>
                <h3 className="text-base font-medium text-[#F2F5F4] mb-1.5">
                  {isBn ? 'বাড়ি ও ফ্ল্যাট যুক্ত করুন' : 'Add your property & units'}
                </h3>
                <p className="text-xs sm:text-sm text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'আপনার বাড়ির নাম, ঠিকানা এবং তলা অনুযায়ী ফ্ল্যাটগুলো যুক্ত করুন।'
                    : 'Enter your building details, floors, and individual rental units in minutes.'}
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0A0F0D] hover:border-white/15 transition-colors">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-[#2DC2BD] bg-[#12664F]/30 border border-[#2DC2BD]/20 mb-4">
                  02
                </div>
                <h3 className="text-base font-medium text-[#F2F5F4] mb-1.5">
                  {isBn ? 'ভাড়াটিয়া ও চুক্তি নিবন্ধন' : 'Register tenants & agreements'}
                </h3>
                <p className="text-xs sm:text-sm text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'ভাড়াটিয়ার মোবাইল, এনআইডি এবং অগ্রিম জামানতের শর্তাবলী রেকর্ড রাখুন।'
                    : 'Link tenants to flats with rental agreements, NID docs, and advance security.'}
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0A0F0D] hover:border-white/15 transition-colors">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-[#2DC2BD] bg-[#12664F]/30 border border-[#2DC2BD]/20 mb-4">
                  03
                </div>
                <h3 className="text-base font-medium text-[#F2F5F4] mb-1.5">
                  {isBn ? 'মাসিক ভাড়া ও নোটিশ ইস্যু' : 'Generate rent & issue notices'}
                </h3>
                <p className="text-xs sm:text-sm text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'বিদ্যুৎ ও পানির বিলসহ মাসিক ভাড়া তৈরি করুন এবং ভাড়াটিয়াকে নোটিশ পাঠান।'
                    : 'Generate monthly rent records with utility splits and issue formal rent notices.'}
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0A0F0D] hover:border-white/15 transition-colors">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-[#2DC2BD] bg-[#12664F]/30 border border-[#2DC2BD]/20 mb-4">
                  04
                </div>
                <h3 className="text-base font-medium text-[#F2F5F4] mb-1.5">
                  {isBn ? 'টাকা আদায় ও মানি রিসিট' : 'Record payments & receipts'}
                </h3>
                <p className="text-xs sm:text-sm text-[#9AA5A1] leading-relaxed">
                  {isBn
                    ? 'বিকাশ বা নগদ আদায় এন্ট্রি করুন এবং সাথে সাথে প্রিন্ট বা ডিজিটাল রসিদ দিন।'
                    : 'Log cash or MFS payments, calculate partial balances, and print receipts.'}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ========================================================================= */}
        {/* WHY BARIVARA (BENEFITS TAILORED FOR BANGLADESH)                           */}
        {/* ========================================================================= */}
        <motion.section
          id="why-barivara"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="py-16 md:py-20 border-t border-white/[0.08]"
        >
          <div className="max-w-[1160px] mx-auto px-5">
            <div className="bg-[#0A0F0D] border border-white/[0.08] rounded-2xl p-7 lg:p-10">
              <div className="max-w-2xl mb-8">
                <span className="text-xs font-semibold tracking-wider text-[#2DC2BD] uppercase block mb-2">
                  {isBn ? 'সুবিধাসমূহ' : 'WHY BARIVARA'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#F2F5F4]">
                  {isBn
                    ? 'বাংলাদেশের বাড়িওয়ালাদের জন্য বিশেষভাবে তৈরি।'
                    : 'Built specifically for rent management in Bangladesh.'}
                </h2>
                <p className="text-xs sm:text-sm text-[#9AA5A1] mt-1.5 leading-relaxed">
                  {isBn
                    ? 'কাগজের খাতা আর রসিদ বইয়ের যুগ শেষ। আধুনিক প্রপার্টি পরিচালনায় বাড়িভাড়া আপনার নির্ভরযোগ্য সহকারী।'
                    : 'Everything you need to run your properties profitably, with cultural grounding and zero clutter.'}
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#12664F]/30 border border-[#2DC2BD]/20 flex items-center justify-center text-[#2DC2BD] mb-3">
                    <Globe className="w-4 h-4" />
                  </div>
                  <b className="block text-sm font-medium text-[#F2F5F4] mb-1">
                    {isBn ? 'বাংলা ও ইংরেজি উভয় ভাষায় সহজ' : 'Bangla-First & Bilingual'}
                  </b>
                  <p className="text-xs text-[#9AA5A1] leading-relaxed">
                    {isBn
                      ? 'বাঙালি বাড়িওয়ালা ও ভাড়াটিয়াদের সুবিধার জন্য সম্পূর্ণ বাংলায় ব্যবহারের সুযোগ।'
                      : 'Switch between authentic Bangla and English anytime with a single click.'}
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#12664F]/30 border border-[#2DC2BD]/20 flex items-center justify-center text-[#2DC2BD] mb-3">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <b className="block text-sm font-medium text-[#F2F5F4] mb-1">
                    {isBn ? 'বিকাশ, নগদ ও ব্যাংক রিকনসিলিয়েশন' : 'Local Payment Tracking'}
                  </b>
                  <p className="text-xs text-[#9AA5A1] leading-relaxed">
                    {isBn
                      ? 'নগদ টাকা ছাড়াও বিকাশ, নগদ বা ব্যাংক ট্রান্সফারের মাধ্যমে প্রাপ্ত ভাড়ার সঠিক হিসাব।'
                      : 'Built-in tracking for cash, bKash, Nagad, Rocket, and direct bank deposits.'}
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#12664F]/30 border border-[#2DC2BD]/20 flex items-center justify-center text-[#2DC2BD] mb-3">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <b className="block text-sm font-medium text-[#F2F5F4] mb-1">
                    {isBn ? 'ডিজিটাল মানি রিসিট (A4 ও প্রিন্ট)' : 'Printable Money Receipts'}
                  </b>
                  <p className="text-xs text-[#9AA5A1] leading-relaxed">
                    {isBn
                      ? 'ভাউচার নম্বরসহ নির্ভরযোগ্য মানি রিসিট তৈরি করুন এবং হোয়াটসঅ্যাপে সহজে শেয়ার করুন।'
                      : 'Generate stamped A4 or thermal receipts that replace old carbon-paper receipt books.'}
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#12664F]/30 border border-[#2DC2BD]/20 flex items-center justify-center text-[#2DC2BD] mb-3">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <b className="block text-sm font-medium text-[#F2F5F4] mb-1">
                    {isBn ? 'অগ্রিম জামানত ও বকেয়া হিসাব' : 'Advance Deposit Tracking'}
                  </b>
                  <p className="text-xs text-[#9AA5A1] leading-relaxed">
                    {isBn
                      ? 'ভাড়াটিয়ার সিকিউরিটি ডিপোজিট ও মাসিক বকেয়া টাকার নিখুঁত হিসাব রাখুন।'
                      : 'Keep clear custody of advance deposits, deductions, and unpaid arrears.'}
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#12664F]/30 border border-[#2DC2BD]/20 flex items-center justify-center text-[#2DC2BD] mb-3">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <b className="block text-sm font-medium text-[#F2F5F4] mb-1">
                    {isBn ? 'এনআইডি ও পুলিশ ভেরিফিকেশন প্রস্তুতি' : 'NID & Police Verification'}
                  </b>
                  <p className="text-xs text-[#9AA5A1] leading-relaxed">
                    {isBn
                      ? 'ভাড়াটিয়া ও পরিবারের এনআইডি তথ্য নিরাপদে ক্লাউডে সংরক্ষণ করুন।'
                      : 'Store tenant identity photos, emergency contacts, and police verification forms securely.'}
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#12664F]/30 border border-[#2DC2BD]/20 flex items-center justify-center text-[#2DC2BD] mb-3">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <b className="block text-sm font-medium text-[#F2F5F4] mb-1">
                    {isBn ? 'মোবাইল ও কম্পিউটার উভয় থেকেই সচল' : 'Cloud Access Anywhere'}
                  </b>
                  <p className="text-xs text-[#9AA5A1] leading-relaxed">
                    {isBn
                      ? 'বাড়িওয়ালা দেশ বা প্রবাস যেখান থেকেই থাকুন, যেকোনো ডিভাইস থেকে সম্পূর্ণ হিসাব দেখতে পাবেন।'
                      : 'Manage your portfolio seamlessly from your smartphone, tablet, or home laptop.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION                                                      */}
        {/* ========================================================================= */}
        <motion.section
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="py-16 md:py-20 border-t border-white/[0.08]"
        >
          <div className="max-w-[1160px] mx-auto px-5 text-center">
            <div className="border border-white/10 rounded-2xl p-8 lg:p-14 bg-gradient-to-b from-[#0C1511] to-[#080C0A] max-w-3xl mx-auto space-y-5">
              <span className="text-xs font-semibold tracking-wider text-[#2DC2BD] uppercase block">
                {isBn ? 'আজই শুরু করুন' : 'GET STARTED TODAY'}
              </span>

              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#F2F5F4] leading-tight">
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

              <p className="text-sm text-[#9AA5A1] max-w-md mx-auto leading-relaxed">
                {isBn
                  ? 'কাগজের খাতা আর হিসাবের গোলকধাঁধা থেকে মুক্তি পান। এখনই যোগ দিন বাড়িভাড়ার আধুনিক প্ল্যাটফর্মে।'
                  : 'Join property owners and managers across Bangladesh who manage properties and collections stress-free.'}
              </p>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#12664F] to-[#1a8a6c] hover:brightness-110 active:brightness-95 transition-all shadow-sm landing-focus"
                >
                  <span>{isBn ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন' : 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-[#F2F5F4] border border-white/15 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.05] transition-all landing-focus"
                >
                  <span>{isBn ? 'লগইন করুন' : 'Sign In to Account'}</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* ========================================================================= */}
      {/* FOOTER                                                                    */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/[0.08] bg-[#050706] pt-12 pb-10 relative z-10">
        <div className="max-w-[1160px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Col 1 & 2: Brand Information */}
            <div className="lg:col-span-2 space-y-3">
              <Link href="#top" className="flex items-center gap-2.5 group landing-focus">
                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-white/5 p-1 flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Barivara Logo"
                    width={28}
                    height={28}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold tracking-tight text-[#F2F5F4]">Barivara</span>
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
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-[#F2F5F4] tracking-wider uppercase">
                {isBn ? 'প্রোডাক্ট' : 'Product'}
              </h4>
              <ul className="space-y-1.5 text-xs text-[#9AA5A1]">
                <li>
                  <Link href="#features" className="hover:text-[#F2F5F4] transition-colors landing-focus">
                    {isBn ? 'ফিচারসমূহ' : 'Features'}
                  </Link>
                </li>
                <li>
                  <Link href="#dashboard-preview" className="hover:text-[#F2F5F4] transition-colors landing-focus">
                    {isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-[#F2F5F4] transition-colors landing-focus">
                    {isBn ? 'কীভাবে কাজ করে' : 'How It Works'}
                  </Link>
                </li>
                <li>
                  <Link href="#why-barivara" className="hover:text-[#F2F5F4] transition-colors landing-focus">
                    {isBn ? 'সুবিধাসমূহ' : 'Why Barivara'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Account */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-[#F2F5F4] tracking-wider uppercase">
                {isBn ? 'অ্যাকাউন্ট' : 'Account'}
              </h4>
              <ul className="space-y-1.5 text-xs text-[#9AA5A1]">
                <li>
                  <Link href="/login" className="hover:text-[#F2F5F4] transition-colors landing-focus">
                    {isBn ? 'লগইন' : 'Sign In'}
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-[#F2F5F4] transition-colors landing-focus">
                    {isBn ? 'রেজিস্ট্রেশন' : 'Register'}
                  </Link>
                </li>
                <li>
                  <Link href="/forgot-password" className="hover:text-[#F2F5F4] transition-colors landing-focus">
                    {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password'}
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link href="/dashboard" className="text-[#2DC2BD] hover:underline font-medium landing-focus">
                      {isBn ? 'ড্যাশবোর্ডে যান' : 'Go to Dashboard'}
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Col 5: Navigation */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-[#F2F5F4] tracking-wider uppercase">
                {isBn ? 'ভাষা ও নেভিগেশন' : 'Language & Navigation'}
              </h4>
              <ul className="space-y-1.5 text-xs text-[#9AA5A1]">
                <li>
                  <button
                    onClick={toggleLanguage}
                    type="button"
                    className="hover:text-[#F2F5F4] transition-colors text-left flex items-center gap-1.5 cursor-pointer landing-focus"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#2DC2BD]" />
                    <span>{isBn ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}</span>
                  </button>
                </li>
                <li>
                  <Link href="#top" className="hover:text-[#F2F5F4] transition-colors landing-focus">
                    {isBn ? 'পৃষ্ঠার শুরুতে যান' : 'Back to top'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-10 pt-5 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between text-xs text-[#9AA5A1]/70 gap-2">
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