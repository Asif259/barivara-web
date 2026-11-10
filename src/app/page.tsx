'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Home,
  Layers,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ArrowUpRight,
  Globe,
  Building2,
  Users,
  FileText,
  MessageSquare,
  CheckCircle2,
  Zap,
  ShieldAlert,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  X,
  ShieldCheck,
} from 'lucide-react';
import {
  PRODUCT_MODULES,
  STATS,
  PROCESS_STEPS,
  TESTIMONIALS,
  ARTICLES,
} from '@/components/landing/landing-data';
import {
  ProductModuleItem,
  SupportedLocale,
} from '@/components/landing/landing-types';
import { toast } from 'sonner';

export default function LandingPage() {
  const [locale, setLocale] = useState<SupportedLocale>('en');
  const isBn = locale === 'bn';

  // Filter states
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedScale, setSelectedScale] = useState<string>('all');

  // Modal states
  const [quickViewModule, setQuickViewModule] = useState<ProductModuleItem | null>(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  // Testimonial pagination state
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Consultation form state
  const [consultName, setConsultName] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultUnits, setConsultUnits] = useState('1–5');
  const [consultLocation, setConsultLocation] = useState('Dhaka');

  // Newsletter state
  const [footerEmail, setFooterEmail] = useState('');
  const [isFooterSubscribed, setIsFooterSubscribed] = useState(false);

  // Floating toast state
  const [floatingToast, setFloatingToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const showToastNotification = useCallback((msg: string) => {
    setFloatingToast({ message: msg, visible: true });
    setTimeout(() => {
      setFloatingToast((prev) => ({ ...prev, visible: false }));
    }, 3200);

    toast(msg, {
      style: {
        background: '#16171a',
        color: '#ffffff',
        border: '1px solid #10B981',
      },
    });
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'en' ? 'bn' : 'en'));
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedType('all');
    setSelectedModule('all');
    setSelectedScale('all');
    showToastNotification(
      locale === 'bn' ? 'সকল ফিল্টার রিসেট করা হয়েছে' : 'Filters reset to default'
    );
  }, [locale, showToastNotification]);

  const handleSearchClick = useCallback(() => {
    const el = document.getElementById('properties');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    showToastNotification(
      locale === 'bn' ? 'মডিউল তালিকা আপডেট হয়েছে' : 'Management modules filtered'
    );
  }, [locale, showToastNotification]);

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultName || !consultPhone) return;
    showToastNotification(
      locale === 'bn'
        ? `ধন্যবাদ ${consultName}! আপনার ডেমো অনুরোধ গৃহীত হয়েছে।`
        : `Thank you, ${consultName}! Our onboarding team will call you.`
    );
    setConsultName('');
    setConsultPhone('');
    setIsConsultationOpen(false);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail || !footerEmail.includes('@')) return;
    setIsFooterSubscribed(true);
    showToastNotification(
      locale === 'bn' ? 'সফলভাবে সাবস্ক্রাইব করা হয়েছে!' : 'Subscribed to BariVara Property Dispatch.'
    );
  };

  // Keyboard navigation & body scroll lock for modals
  useEffect(() => {
    if (!isConsultationOpen && !quickViewModule) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsConsultationOpen(false);
        setQuickViewModule(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isConsultationOpen, quickViewModule]);

  // Filtered modules
  const filteredModules = useMemo(() => {
    return PRODUCT_MODULES.filter((item) => {
      if (selectedModule !== 'all' && item.category !== selectedModule) {
        return false;
      }
      return true;
    });
  }, [selectedModule]);

  const totalTestimonials = TESTIMONIALS.length;
  const currentTestimonial = TESTIMONIALS[testimonialIndex] || TESTIMONIALS[0];

  const handlePrevTestimonial = () => {
    setTestimonialIndex((prev) => (prev === 0 ? totalTestimonials - 1 : prev - 1));
  };

  const handleNextTestimonial = () => {
    setTestimonialIndex((prev) => (prev === totalTestimonials - 1 ? 0 : prev + 1));
  };

  const card1 = filteredModules[0] || PRODUCT_MODULES[0];
  const card2 = filteredModules[1] || PRODUCT_MODULES[1] || card1;
  const card3 = filteredModules[2] || PRODUCT_MODULES[2] || card1;
  const card4 = filteredModules[3] || PRODUCT_MODULES[3] || card1;
  const card5 = filteredModules[4] || PRODUCT_MODULES[4] || card1;

  return (
    <div className="bg-[#12664F] min-h-screen text-white font-sans antialiased ">
      {/* ─────────────────────────────────────────────────────────────
          MAIN PAGE FRAME (Dignified Emerald Frame + Obsidian Container)
      ───────────────────────────────────────────────────────────── */}
      <div className="page-frame  min-h-screen relative overflow-hidden">
        

        {/* ─────────────────────────────────────────────────────────────
            1. TOP NAVIGATION BAR (Obsidian + Accent Emerald #10B981)
        ───────────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-[#16171a]/95 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="#hero" className="flex items-center gap-2.5 group">
              {/* Geometric Pixel Emerald Logo */}
              <img className="w-8 h-8 text-[#10B981] transition-transform group-hover:scale-110" src="logo.png" />
              <span className="font-extrabold tracking-[0.18em] text-sm sm:text-base text-white">
                BARIVARA
              </span>
            </Link>

            {/* Center Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-gray-300">
              <a href="#hero" className="text-[#10B981] font-semibold transition">
                {isBn ? 'হোম' : 'Home'}
              </a>
              <a href="#process" className="hover:text-[#10B981] transition">
                {isBn ? 'পদ্ধতি' : 'About Us'}
              </a>
              <a href="#properties" className="hover:text-[#10B981] transition">
                {isBn ? 'কোর ফিচার' : 'Property'}
              </a>
              <a href="#testimonials" className="hover:text-[#10B981] transition">
                {isBn ? 'অভিজ্ঞতা' : 'Landlords'}
              </a>
              <a href="#blog" className="hover:text-[#10B981] transition">
                {isBn ? 'ব্লগ ও গাইড' : 'Blog'}
              </a>
              <a href="#cta" className="hover:text-[#10B981] transition">
                {isBn ? 'যোগাযোগ' : 'Contact'}
              </a>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Bilingual Switcher */}
              <button
                onClick={toggleLocale}
                aria-label="Switch Language"
                className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1c1d21] hover:bg-[#24262b] border border-white/15 text-[11px] font-medium text-gray-200 transition"
              >
                <Globe className="w-3.5 h-3.5 text-[#10B981]" />
                <span>{isBn ? 'English' : 'বাংলা'}</span>
              </button>

              {/* Login Link */}
              <Link
                href="/login"
                className="hidden lg:inline-flex btn-press px-3 py-1.5 rounded bg-transparent hover:bg-white/5 border border-white/15 text-gray-300 font-semibold text-[11px] transition"
              >
                {isBn ? 'লগ ইন' : 'Sign In'}
              </Link>

              {/* Primary Action Button (Solid Emerald #12664F + Hover #0E513F) */}
              <button
                onClick={() => setIsConsultationOpen(true)}
                className="btn-press px-3.5 py-1.5 rounded bg-[#12664F] hover:bg-[#0E513F] text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-sm border border-[#10B981]/40"
              >
                <span>{isBn ? 'যোগাযোগ করুন' : 'Get in Touch'}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#10B981]" />
              </button>
            </div>
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            2. HERO SECTION (Villa Backdrop, Sky Title & Filter Strip)
        ───────────────────────────────────────────────────────────── */}
        <section id="hero" className="relative w-full">
          {/* Sky & Property Villa Container */}
          <div className="relative w-full h-[540px] sm:h-[630px] lg:h-[700px] overflow-hidden bg-[#c8dff0]">
            {/* Background Sky & Property Architecture Photo */}
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
              alt="BariVara Modern Residence"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-105 contrast-105"
            />

            {/* Bright sky upper gradient so giant BARIVARA typography pops cleanly */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#e8f1f8]/90 via-transparent to-[#16171a] pointer-events-none" />

            {/* Giant "BARIVARA" Display Title Across the Top Sky */}
            <div className="absolute top-5 sm:top-7 inset-x-0 flex justify-center pointer-events-none px-4">
              <h1 className="hero-giant-title text-[16vw] sm:text-[13.5vw] lg:text-[168px] tracking-[0.16em] text-center select-none drop-shadow-sm font-extrabold">
                BARIVARA
              </h1>
            </div>

            {/* Center-Left Floating Glassmorphic Info Overlay */}
            <div className="absolute left-6 sm:left-12 lg:left-24 top-1/2 -translate-y-4 max-w-xs sm:max-w-sm bg-[#111214]/85 backdrop-blur-md border border-white/15 p-4 sm:p-5 rounded-lg shadow-2xl">
              <p className="text-xs sm:text-sm text-gray-100 font-medium leading-relaxed">
                {isBn
                  ? 'কাগজের খাতার বিশৃঙ্খলা ভুলে বাড়ি ও ফ্ল্যাটের সম্পূর্ণ হিসাব রাখুন এক জায়গায়। ১-ক্লিকে হোয়াটসঅ্যাপ রসিদ, বিদ্যুৎ সাব-মিটার বিল বণ্টন ও বিকাশ/নগদ পেমেন্ট রিকনসিলিয়েশন।'
                  : 'Discover modern living spaces crafted for timeless comfort, architectural clarity, and effortless indoor-outdoor flow.'}
              </p>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  {isBn ? '১–১৫ ইউনিটের বাড়িওয়ালাদের জন্য' : '240+ Verified Listings'}
                </span>
                <a href="#properties" className="text-[#10B981] hover:text-[#059669] font-semibold hover:underline">
                  {isBn ? 'মডিউল দেখুন ↓' : 'Explore ↓'}
                </a>
              </div>
            </div>

            {/* Bottom Filter Bar Overlapping Hero Footer */}
            <div className="absolute bottom-0 inset-x-0 bg-[#16171a]/95 backdrop-blur-md border-t border-b border-white/10">
              <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                  
                  {/* Filter 1: Property Type */}
                  <div className="lg:col-span-3 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-white/10 pb-2 sm:pb-0 sm:pr-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#10B981] font-semibold">
                        <Home className="w-3 h-3 text-[#10B981]" />
                        <span>{isBn ? 'প্রপার্টির ধরন' : 'Property Type'}</span>
                      </div>
                      <select
                        id="filter-prop-type"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-transparent text-white text-xs font-medium focus:outline-none mt-0.5 cursor-pointer pr-2"
                      >
                        <option value="all" className="bg-[#16171a] text-white">
                          {isBn ? 'সকল প্রপার্টি ও ফ্ল্যাট' : 'All Modern Residences'}
                        </option>
                        <option value="residential" className="bg-[#16171a] text-white">
                          {isBn ? 'আবাসিক ফ্ল্যাট (ফ্যামিলি)' : 'Residential Villa'}
                        </option>
                        <option value="commercial" className="bg-[#16171a] text-white">
                          {isBn ? 'বাণিজ্যিক স্পেস ও দোকান' : 'Minimalist Concrete'}
                        </option>
                        <option value="sublet" className="bg-[#16171a] text-white">
                          {isBn ? 'সাবলেট ও মেস রুম' : 'Glass Pavilion'}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Filter 2: Capability / Feature */}
                  <div className="lg:col-span-3 flex items-center justify-between border-b sm:border-b-0 lg:border-r border-white/10 pb-2 sm:pb-0 sm:pr-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#10B981] font-semibold">
                        <Layers className="w-3 h-3 text-[#10B981]" />
                        <span>{isBn ? 'প্রধান ফিচার' : 'Key Feature'}</span>
                      </div>
                      <select
                        id="filter-module"
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        className="bg-transparent text-white text-xs font-medium focus:outline-none mt-0.5 cursor-pointer pr-2"
                      >
                        <option value="all" className="bg-[#16171a] text-white">
                          {isBn ? 'সকল ফিচার দেখুন' : 'All Management Modules'}
                        </option>
                        <option value="Receipts" className="bg-[#16171a] text-white">
                          {isBn ? '১-ক্লিক হোয়াটসঅ্যাপ রসিদ' : 'WhatsApp Receipts & A4'}
                        </option>
                        <option value="Utilities" className="bg-[#16171a] text-white">
                          {isBn ? 'বিদ্যুৎ সাব-মিটার ও বিল বণ্টন' : 'Sub-Meter & Utilities'}
                        </option>
                        <option value="Tenants" className="bg-[#16171a] text-white">
                          {isBn ? 'ভাড়াটিয়া এনআইডি ও পুলিশ ফরম' : 'Tenant NID & Police Form'}
                        </option>
                        <option value="Payments" className="bg-[#16171a] text-white">
                          {isBn ? 'বিকাশ/নগদ ও বকেয়া হিসাব' : 'bKash/Nagad Dues Tracking'}
                        </option>
                        <option value="Ledger" className="bg-[#16171a] text-white">
                          {isBn ? 'আয়-ব্যয় খতিয়ান ও সিএসভি' : 'Income-Expense Khata'}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Filter 3: Scale / Range */}
                  <div className="lg:col-span-3 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-white/10 pb-2 sm:pb-0 sm:pr-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#10B981] font-semibold">
                        <Sparkles className="w-3 h-3 text-[#10B981]" />
                        <span>{isBn ? 'ইউনিট সংখ্যা' : 'Units Scale'}</span>
                      </div>
                      <select
                        id="filter-scale"
                        value={selectedScale}
                        onChange={(e) => setSelectedScale(e.target.value)}
                        className="bg-transparent text-white text-xs font-medium focus:outline-none mt-0.5 cursor-pointer pr-2 tabular-nums"
                      >
                        <option value="all" className="bg-[#16171a] text-white">
                          {isBn ? '১–১৫+ ইউনিট (সকল)' : '1–15+ Units (All)'}
                        </option>
                        <option value="small" className="bg-[#16171a] text-white">
                          {isBn ? '১–৫টি ফ্ল্যাট' : '1–5 Units'}
                        </option>
                        <option value="medium" className="bg-[#16171a] text-white">
                          {isBn ? '৬–১০টি ফ্ল্যাট' : '6–10 Units'}
                        </option>
                        <option value="large" className="bg-[#16171a] text-white">
                          {isBn ? '১১–১৫+ ফ্ল্যাট' : '11–15+ Units'}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Filter 4: Actions (Primary Emerald #12664F + Hover #0E513F) */}
                  <div className="lg:col-span-3 flex items-center justify-end gap-2">
                    <button
                      onClick={handleResetFilters}
                      className="px-3 py-2 rounded bg-[#1c1d21] hover:bg-[#24262b] border border-white/15 text-[11px] text-gray-300 transition"
                    >
                      <span className="flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" />
                        <span>{isBn ? 'রিসেট' : 'Reset'}</span>
                      </span>
                    </button>
                    <button
                      onClick={handleSearchClick}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded bg-[#12664F] hover:bg-[#0E513F] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow border border-[#10B981]/40"
                    >
                      <span>{isBn ? 'অনুসন্ধান' : 'Search'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#10B981]" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. "AWESOME DEAL THIS WEEK!" ASYMMETRIC BENTO GRID
        ───────────────────────────────────────────────────────────── */}
        <section id="properties" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-14 max-w-6xl mx-auto">
          {/* Section Heading */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#10B981] mb-2 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>{isBn ? 'কোর ফিচার ও ব্যবস্থাপনা মডিউল' : 'Featured Properties'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              {isBn ? 'কাগজের খাতার ঝামেলাহীন পূর্ণাঙ্গ সমাধান' : 'Awesome deal this week!'}
            </h2>
          </div>

          {/* 12-Column Staggered Asymmetric Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT + CENTER 8 COLUMNS */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* TOP SUB-ROW: Card 1 (Wider Left) + Card 2 (Compact Center) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* CARD 1: Top-Left Medium-Wide (WhatsApp Receipts) */}
                {card1 && (
                  <article
                    onClick={() => setQuickViewModule(card1)}
                    className="prop-card md:col-span-7 group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[16/10] mb-3 border border-white/10 group-hover:border-[#10B981]/50 transition-colors">
                      <Image
                        src={card1.imageUrl}
                        alt={card1.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 45vw"
                        className="prop-img object-cover object-top transition duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded text-[#10B981] border border-[#307473]/40">
                        {isBn ? card1.badgeBn : card1.badge}
                      </span>
                      <div className="absolute bottom-3 left-3 right-3 bg-[#111214]/90 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 text-[11px] text-gray-200 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span className="truncate">{isBn ? card1.sampleUiSnippetBn : card1.sampleUiSnippetEn}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#10B981] transition">
                        {isBn ? card1.titleBn : card1.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                        {(isBn ? card1.specsBn : card1.specs).slice(0, 3).map((spec, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                            {spec}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#2DC2BD]">
                          {isBn ? card1.highlightMetricBn : card1.highlightMetric}
                        </span>
                        <button
                          aria-label={`View ${card1.title}`}
                          className="arrow-btn w-7 h-7 bg-[#12664F] hover:bg-[#10B981] hover:text-[#111214] text-white flex items-center justify-center rounded-sm transition border border-[#10B981]/30"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                )}

                {/* CARD 2: Top-Center Square (Sub-Meter Math) */}
                {card2 && (
                  <article
                    onClick={() => setQuickViewModule(card2)}
                    className="prop-card md:col-span-5 md:mt-8 group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[4/3] mb-3 border border-white/10 group-hover:border-[#10B981]/50 transition-colors">
                      <Image
                        src={card2.imageUrl}
                        alt={card2.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 30vw"
                        className="prop-img object-cover object-top transition duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded text-gray-200 border border-white/10">
                        {isBn ? card2.badgeBn : card2.badge}
                      </span>
                      <div className="absolute bottom-3 left-3 right-3 bg-[#111214]/90 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 text-[11px] text-gray-200 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span className="truncate">{isBn ? 'ডেসকো/ডিপিডিসি হিসাব' : 'Sub-Meter Math'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#10B981] transition">
                        {isBn ? card2.titleBn : card2.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                        {(isBn ? card2.specsBn : card2.specs).slice(0, 2).map((spec, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                            {spec}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#2DC2BD]">
                          {isBn ? card2.highlightMetricBn : card2.highlightMetric}
                        </span>
                        <button
                          aria-label={`View ${card2.title}`}
                          className="arrow-btn w-7 h-7 bg-[#12664F] hover:bg-[#10B981] hover:text-[#111214] text-white flex items-center justify-center rounded-sm transition border border-[#10B981]/30"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                )}

              </div>

              {/* BOTTOM SUB-ROW: Card 4 (Compact Left) + Card 5 (Wider Center) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* CARD 4: Bottom-Left Compact (bKash/Nagad Reconciliation) */}
                {card4 && (
                  <article
                    onClick={() => setQuickViewModule(card4)}
                    className="prop-card md:col-span-5 md:mt-6 group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[4/3] mb-3 border border-white/10 group-hover:border-[#10B981]/50 transition-colors">
                      <Image
                        src={card4.imageUrl}
                        alt={card4.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 30vw"
                        className="prop-img object-cover object-top transition duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded text-gray-200 border border-white/10">
                        {isBn ? card4.badgeBn : card4.badge}
                      </span>
                      <div className="absolute bottom-3 left-3 right-3 bg-[#111214]/90 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 text-[11px] text-gray-200 flex items-center gap-2">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span className="truncate">{isBn ? 'বিকাশ ও নগদ TrxID' : 'bKash TrxID Logger'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#10B981] transition">
                        {isBn ? card4.titleBn : card4.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                        {(isBn ? card4.specsBn : card4.specs).slice(0, 2).map((spec, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                            {spec}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#2DC2BD]">
                          {isBn ? card4.highlightMetricBn : card4.highlightMetric}
                        </span>
                        <button
                          aria-label={`View ${card4.title}`}
                          className="arrow-btn w-7 h-7 bg-[#12664F] hover:bg-[#10B981] hover:text-[#111214] text-white flex items-center justify-center rounded-sm transition border border-[#10B981]/30"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                )}

                {/* CARD 5: Bottom-Center Wide (Income-Expense Khata) */}
                {card5 && (
                  <article
                    onClick={() => setQuickViewModule(card5)}
                    className="prop-card md:col-span-7 group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[16/10] mb-3 border border-white/10 group-hover:border-[#10B981]/50 transition-colors">
                      <Image
                        src={card5.imageUrl}
                        alt={card5.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 45vw"
                        className="prop-img object-cover object-top transition duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded text-gray-200 border border-white/10">
                        {isBn ? card5.badgeBn : card5.badge}
                      </span>
                      <div className="absolute bottom-3 left-3 right-3 bg-[#111214]/90 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 text-[11px] text-gray-200 flex items-center gap-2">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span className="truncate">{isBn ? card5.sampleUiSnippetBn : card5.sampleUiSnippetEn}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#10B981] transition">
                        {isBn ? card5.titleBn : card5.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                        {(isBn ? card5.specsBn : card5.specs).slice(0, 3).map((spec, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                            {spec}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#2DC2BD]">
                          {isBn ? card5.highlightMetricBn : card5.highlightMetric}
                        </span>
                        <button
                          aria-label={`View ${card5.title}`}
                          className="arrow-btn w-7 h-7 bg-[#12664F] hover:bg-[#10B981] hover:text-[#111214] text-white flex items-center justify-center rounded-sm transition border border-[#10B981]/30"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                )}

              </div>
            </div>

            {/* RIGHT 4 COLUMNS: CARD 3 (Tall Vertical Showcase Card - DMP Police Form) */}
            {card3 && (
              <article
                onClick={() => setQuickViewModule(card3)}
                className="prop-card lg:col-span-4 lg:-mt-4 group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[3/4.3] mb-3 border border-white/10 group-hover:border-[#10B981]/50 transition-colors">
                  <Image
                    src={card3.imageUrl}
                    alt={card3.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="prop-img object-cover object-top transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded text-[#10B981] border border-[#10B981]/30">
                    {isBn ? card3.badgeBn : card3.badge}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 bg-[#111214]/90 backdrop-blur-md px-3 py-2 rounded border border-white/10 text-[11px] text-gray-200 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span className="truncate">{isBn ? 'ডিএমপি ভাড়াটিয়া তথ্য ফরম' : 'DMP Police Form Export'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#10B981] transition">
                    {isBn ? card3.titleBn : card3.title}
                  </h3>
                  <div className="flex flex-col gap-1.5 text-[11px] text-gray-400">
                    {(isBn ? card3.specsBn : card3.specs).map((spec, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2DC2BD]">
                      {isBn ? card3.highlightMetricBn : card3.highlightMetric}
                    </span>
                    <button
                      aria-label={`View ${card3.title}`}
                      className="arrow-btn w-7 h-7 bg-[#12664F] hover:bg-[#10B981] hover:text-[#111214] text-white flex items-center justify-center rounded-sm transition border border-[#10B981]/30"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )}

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. FOUR OVERLAPPING CIRCULAR STATS BADGES
        ───────────────────────────────────────────────────────────── */}
        <section className="py-8 sm:py-12 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:flex md:items-center md:justify-center gap-4 md:gap-0">
            {STATS.map((stat, idx) => (
              <div
                key={idx}
                className="stat-circle w-full aspect-square max-w-[260px] mx-auto md:mx-0 rounded-full bg-[#1c1d21]/90 border border-white/10 flex flex-col items-center justify-center text-center p-6 hover:border-[#10B981]/50 transition duration-300 shadow-xl"
              >
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight tabular-nums">
                  {isBn ? stat.valueBn : stat.value}
                </span>
                <span className="text-[11px] text-[#10B981] mt-1.5 uppercase tracking-wider font-semibold">
                  {isBn ? stat.labelBn : stat.labelEn}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 max-w-[150px] leading-tight">
                  {isBn ? stat.sublabelBn : stat.sublabelEn}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. "A CALM, CONSIDERED PATH" VERTICAL TIMELINE
        ───────────────────────────────────────────────────────────── */}
        <section id="process" className="py-16 sm:py-24 px-4 sm:px-8 max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#10B981] mb-2 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>{isBn ? 'সহজ ৪-ধাপের প্রক্রিয়া' : 'How It Works'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug">
              {isBn ? (
                <>কাগজের খাতার ঝামেলাহীন শান্ত ও সুশৃঙ্খল<br />ডিজিটাল ভাড়া ব্যবস্থাপনা</>
              ) : (
                <>A calm, considered path to<br />your next home</>
              )}
            </h2>
          </div>

          {/* Vertical Stack of 4 Circular Steps */}
          <div className="space-y-8 sm:space-y-10 max-w-xl mx-auto">
            {PROCESS_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left group"
              >
                {/* Step Visual Node */}
                {step.iconType === 'users' && step.imageBadgeUrl ? (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#10B981]/50 shrink-0 shadow-lg">
                    <Image
                      src={step.imageBadgeUrl}
                      alt={isBn ? step.titleBn : step.titleEn}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#1f2126] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#10B981] transition">
                    {step.iconType === 'building' && (
                      <Building2 className="w-9 h-9 text-[#10B981]" />
                    )}
                    {step.iconType === 'users' && (
                      <Users className="w-9 h-9 text-[#10B981]" />
                    )}
                    {step.iconType === 'invoice' && (
                      <FileText className="w-9 h-9 text-[#10B981]" />
                    )}
                    {step.iconType === 'whatsapp' && (
                      <MessageSquare className="w-9 h-9 text-[#10B981]" />
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white mb-1.5">
                    {isBn ? step.titleBn : step.titleEn}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-xs sm:max-w-md">
                    {isBn ? step.descBn : step.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. BRAND DIVIDER BANNER WITH CENTRAL EMERALD EMBLEM
        ───────────────────────────────────────────────────────────── */}
        <div className="relative w-full border-y border-white/10 bg-[#1a1c20] py-3.5 overflow-hidden select-none">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[10px] tracking-[0.22em] uppercase text-gray-500 font-semibold">
            <span className="hidden sm:inline">{isBn ? 'বাড়ি ও ফ্ল্যাট' : 'Architecture'}</span>
            <span>{isBn ? 'ভাড়াটিয়া এনআইডি' : 'Interior'}</span>
            <span className="hidden md:inline">{isBn ? 'স্বয়ংক্রিয় মাসিক বিল' : 'Luxury Villa'}</span>
            
            {/* Center Emerald Geometric Badge (#12664F + #10B981) */}
            <div
              className="relative mx-4 px-8 py-2 bg-[#12664F] text-[#10B981] border border-[#10B981]/40 rounded-sm shadow-lg flex items-center justify-center"
              style={{ clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)' }}
            >
              <svg className="w-6 h-5 text-[#10B981]" viewBox="0 0 28 24" fill="currentColor">
                <rect x="0" y="0" width="6" height="6" />
                <rect x="22" y="0" width="6" height="6" />
                <rect x="7" y="4" width="6" height="8" />
                <rect x="15" y="4" width="6" height="8" />
                <rect x="11" y="13" width="6" height="11" />
              </svg>
            </div>

            <span className="hidden md:inline">{isBn ? 'হোয়াটসঅ্যাপ রসিদ' : 'Smart Home'}</span>
            <span>{isBn ? 'বিকাশ ও নগদ TrxID' : 'Sustainable'}</span>
            <span className="hidden sm:inline">{isBn ? 'আয়কর সিএসভি রিপোর্ট' : 'Penthouse'}</span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            7. "TRUSTED BY FAMILIES & LANDLORDS" TESTIMONIALS
        ───────────────────────────────────────────────────────────── */}
        <section id="testimonials" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-16 max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#10B981] mb-2 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>{isBn ? 'বাস্তব অভিজ্ঞতা ও মূল্যায়ন' : 'Client Stories'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug">
              {isBn ? (
                <>সারা দেশের বাড়িওয়ালা ও প্রপার্টি মালিকদের<br />নির্ভরযোগ্য সঙ্গী</>
              ) : (
                <>Trusted by families &amp; investors<br />across the region</>
              )}
            </h2>
          </div>

          {/* 2-Column Split Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Portrait with Subtle Architectural Offset Backdrop */}
            <div className="md:col-span-5 relative">
              <div className="relative mx-auto max-w-xs">
                {/* Subtle dark decorative offset block */}
                <div className="absolute -left-4 -bottom-4 w-full h-full bg-[#1c1d21] border border-white/10 -z-10 rounded-sm" />
                
                <div className="overflow-hidden rounded-sm border border-white/15 bg-[#1c1d21] aspect-[4/4.6]">
                  <Image
                    src={currentTestimonial.imageUrl}
                    alt={isBn ? currentTestimonial.nameBn : currentTestimonial.name}
                    width={400}
                    height={460}
                    className="w-full h-full object-cover object-top transition duration-500"
                  />
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-white">
                    {isBn ? currentTestimonial.nameBn : currentTestimonial.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {isBn ? currentTestimonial.roleBn : currentTestimonial.role} • {currentTestimonial.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Quote Content & Interactive Controls */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-6">
              {/* Opening Quote Icon */}
              <div className="text-4xl sm:text-5xl font-serif text-white/80 leading-none select-none">“</div>

              <div>
                <h4 className="text-lg sm:text-xl font-bold text-white mb-3">
                  {isBn ? currentTestimonial.headlineBn : currentTestimonial.headlineEn}
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed min-h-[80px]">
                  &quot;{isBn ? currentTestimonial.quoteBn : currentTestimonial.quoteEn}&quot;
                </p>
              </div>

              {/* Closing Quote Icon Aligned Right */}
              <div className="text-4xl sm:text-5xl font-serif text-white/80 leading-none text-right select-none">”</div>

              {/* Controls & Pagination Row */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevTestimonial}
                    aria-label="Previous Testimonial"
                    className="w-9 h-9 rounded-sm bg-[#1c1d21] hover:bg-[#24262b] border border-white/15 text-gray-300 flex items-center justify-center transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextTestimonial}
                    aria-label="Next Testimonial"
                    className="w-9 h-9 rounded-sm bg-[#12664F] hover:bg-[#0E513F] text-white flex items-center justify-center font-bold transition border border-[#10B981]/40"
                  >
                    <ChevronRight className="w-4 h-4 text-[#10B981]" />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                  <span className="text-[#10B981] font-bold">
                    {String(testimonialIndex + 1).padStart(2, '0')}
                  </span>
                  <div className="w-12 h-[1px] bg-white/20" />
                  <span>{String(totalTestimonials).padStart(2, '0')}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            8. "ARTICLE & BLOG POSTS" 3-COLUMN EDITORIAL SECTION
        ───────────────────────────────────────────────────────────── */}
        <section id="blog" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-14 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#10B981] mb-2 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>{isBn ? 'সহায়িকা ও প্রপার্টি গাইড' : 'Insights & Journal'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              {isBn ? 'বাড়িওয়ালাদের জন্য গুরুত্বপূর্ণ ব্লগ ও পরামর্শ' : 'Article & Blog posts'}
            </h2>
          </div>

          {/* 3 Staggered Blog Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-start">
            {ARTICLES.map((article, idx) => {
              const isSecond = idx === 1;
              const aspectClass = idx === 0 ? 'aspect-[4/3.4]' : idx === 1 ? 'aspect-[4/3]' : 'aspect-[4/2.9]';

              return (
                <article
                  key={article.id}
                  onClick={() =>
                    showToastNotification(
                      locale === 'bn' ? `সহায়িকা: ${article.titleBn}` : `Reading: "${article.titleEn}"`
                    )
                  }
                  className={`group cursor-pointer ${isSecond ? 'md:mt-6' : ''}`}
                >
                  <div className={`relative overflow-hidden rounded-sm ${aspectClass} mb-4 border border-white/10 hover:border-[#10B981]/40 transition-colors bg-[#1c1d21]`}>
                    <Image
                      src={article.imageUrl}
                      alt={isBn ? article.titleBn : article.titleEn}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-[#111214]/80 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2 py-0.5 rounded text-[#2DC2BD] border border-[#307473]/40 font-medium">
                      {isBn ? article.categoryBn : article.categoryEn}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#10B981] transition leading-snug mb-2">
                    {isBn ? article.titleBn : article.titleEn}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {isBn ? article.excerptBn : article.excerptEn}
                  </p>
                  <div className="flex items-center gap-2.5 pt-3 border-t border-white/10">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/20">
                      <Image
                        src={article.authorAvatar}
                        alt={article.author}
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {article.author} • {isBn ? article.readTimeBn : article.readTime}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            9. "READY TO FIND A HOME THAT FEELS RIGHT?" CTA
        ───────────────────────────────────────────────────────────── */}
        <section id="cta" className="relative overflow-hidden border-y border-white/10 louver-graphic">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-14 py-16 sm:py-24 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#10B981] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>{isBn ? 'কাগজহীন স্মার্ট বাড়ি ব্যবস্থাপনা' : '• Private Advisory'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {isBn ? (
                  <>কাগজের খাতার অনিশ্চয়তা ভুলে<br />আজই শুরু করুন বাড়িভাড়া</>
                ) : (
                  <>Ready to find a home<br />that feels right?</>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed">
                {isBn
                  ? '১ থেকে ১৫টি ফ্ল্যাট বা দোকান পরিচালনাকারী বাংলাদেশি বাড়িওয়ালাদের জন্য তৈরি। ১লা তারিখে অটোমেটিক বিল তৈরি করুন, বিকাশে ভাড়া নিয়ে ১-ক্লিকে হোয়াটসঅ্যাপে রসিদ পাঠিয়ে দিন।'
                  : 'Connect with our architectural real estate specialists to unlock pocket listings, private twilight viewings, and bespoke acquisition guidance.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-sm bg-[#12664F] hover:bg-[#0E513F] text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-[#12664F]/30 border border-[#10B981]/40"
                >
                  <span>{isBn ? 'বিনামূল্যে শুরু করুন' : 'Get Started'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#10B981]" />
                </Link>
                <button
                  onClick={() => setIsConsultationOpen(true)}
                  className="px-5 py-2.5 rounded-sm bg-[#16171a]/90 hover:bg-[#24262b] text-white border border-white/20 font-semibold text-xs transition"
                >
                  {isBn ? 'পরামর্শ ও সাপোর্ট' : 'Schedule a Call'}
                </button>
              </div>
            </div>

            {/* Decorative Sculptural Louver Sphere Visual */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-white/15 bg-gradient-to-tr from-[#111214] via-[#24262b] to-white/20 shadow-2xl overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background:
                      'repeating-linear-gradient(-38deg, #111214 0px, #111214 7px, #3b3e45 7px, #ffffff33 11px)',
                  }}
                />
                <div className="relative z-10 w-24 h-24 rounded-full bg-[#111214]/80 backdrop-blur border border-[#10B981]/40 flex items-center justify-center shadow-lg">
                  <svg className="w-9 h-8 text-[#10B981]" viewBox="0 0 28 24" fill="currentColor">
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

        {/* ─────────────────────────────────────────────────────────────
            10. FOOTER
        ───────────────────────────────────────────────────────────── */}
        <footer className="pt-16 pb-10 px-4 sm:px-8 lg:px-14 bg-[#121316] relative">
          <div className="max-w-6xl mx-auto">

            {/* Centered Large Geometric Logo + BARIVARA Wordmark */}
            <div className="flex flex-col items-center text-center mb-14">
              <svg className="w-16 h-14 text-[#10B981] mb-3" viewBox="0 0 28 24" fill="currentColor">
                <rect x="0" y="0" width="6" height="6" />
                <rect x="22" y="0" width="6" height="6" />
                <rect x="7" y="4" width="6" height="8" />
                <rect x="15" y="4" width="6" height="8" />
                <rect x="11" y="13" width="6" height="11" />
              </svg>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[0.22em] text-white">
                BARIVARA
              </h2>
              <p className="text-[11px] text-gray-400 max-w-md mt-2 leading-relaxed">
                {isBn
                  ? 'বাংলাদেশের বাড়িওয়ালা ও প্রপার্টি মালিকদের জন্য আধুনিক, নির্ভরযোগ্য ও স্মার্ট ডিজিটাল ভাড়া ব্যবস্থাপনা প্ল্যাটফর্ম।'
                  : 'Curating architectural homes, minimalist estates, and design-forward residences for discerning buyers and investors worldwide.'}
              </p>
            </div>

            {/* 3-Column Footer Links & Newsletter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10 text-xs">

              {/* Column 1: Menu */}
              <div className="lg:col-span-3 space-y-2.5">
                <h3 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
                  {isBn ? 'মেন্যু' : 'Menu'}
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#hero" className="hover:text-[#10B981] flex items-center gap-1.5 transition">
                      <span className="text-[#10B981]">↗</span> {isBn ? 'মূল পাতা' : 'Home'}
                    </a>
                  </li>
                  <li>
                    <a href="#process" className="hover:text-[#10B981] flex items-center gap-1.5 transition">
                      <span className="text-[#10B981]">↗</span> {isBn ? 'কাজের পদ্ধতি' : 'About Us'}
                    </a>
                  </li>
                  <li>
                    <a href="#properties" className="hover:text-[#10B981] flex items-center gap-1.5 transition">
                      <span className="text-[#10B981]">↗</span> {isBn ? 'প্রপার্টি কালেকশন' : 'Properties'}
                    </a>
                  </li>
                  <li>
                    <a href="#testimonials" className="hover:text-[#10B981] flex items-center gap-1.5 transition">
                      <span className="text-[#10B981]">↗</span> {isBn ? 'বাড়িওয়ালাদের মতামত' : 'Agents'}
                    </a>
                  </li>
                  <li>
                    <a href="#blog" className="hover:text-[#10B981] flex items-center gap-1.5 transition">
                      <span className="text-[#10B981]">↗</span> {isBn ? 'সহায়িকা ও ব্লগ' : 'Blog'}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 2: Office Address */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
                  {isBn ? 'যোগাযোগ ও প্রধান কার্যালয়' : 'Office Address'}
                </h3>
                <p className="text-gray-400 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>Gulshan Centre Point, Road 90, Gulshan-2, Dhaka 1212, Bangladesh</span>
                </p>
                <p className="text-gray-400 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>+880 1700-000000 / +880 2-9880000</span>
                </p>
                <p className="text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>support@barivara.app</span>
                </p>
              </div>

              {/* Column 3: Subscribe Newsletter */}
              <div className="lg:col-span-4 space-y-3">
                <h3 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
                  {isBn ? 'নিউজলেটার সাবস্ক্রিপশন' : 'Subscribe Newsletter'}
                </h3>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  {isBn
                    ? 'বাড়ি ব্যবস্থাপনা ও আইনি পরামর্শের নিয়মিত আপডেট পেতে সাবস্ক্রাইব করুন।'
                    : 'Receive private off-market architectural listings and quarterly market reports directly in your inbox.'}
                </p>

                {isFooterSubscribed ? (
                  <p className="text-[11px] text-[#10B981] py-2">
                    {isBn ? '✓ সফলভাবে সাবস্ক্রাইব করা হয়েছে!' : '✓ Subscribed to BariVara Private Dispatch.'}
                  </p>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex items-center mt-2">
                    <input
                      type="email"
                      required
                      value={footerEmail}
                      onChange={(e) => setFooterEmail(e.target.value)}
                      placeholder={isBn ? 'আপনার ইমেইল...' : 'Enter your email...'}
                      className="w-full bg-[#1c1d21] border border-white/15 rounded-l-sm px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981]"
                    />
                    <button
                      type="submit"
                      aria-label="Subscribe"
                      className="px-3.5 py-2.5 bg-[#12664F] hover:bg-[#0E513F] text-white font-bold rounded-r-sm transition border border-[#10B981]/40"
                    >
                      <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
                    </button>
                  </form>
                )}
              </div>

            </div>

            {/* Bottom Copyright & Legal Row */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
              <p>© 2026 BARIVARA. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a
                  href="#hero"
                  onClick={() => showToastNotification(isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy')}
                  className="hover:text-gray-300 transition"
                >
                  {isBn ? 'গোপনীয়তা' : 'Privacy'}
                </a>
                <a
                  href="#hero"
                  onClick={() => showToastNotification(isBn ? 'শর্তাবলী' : 'Terms of Service')}
                  className="hover:text-gray-300 transition"
                >
                  {isBn ? 'শর্তাবলী' : 'Terms'}
                </a>
                <a
                  href="#hero"
                  onClick={() => showToastNotification(isBn ? 'নিরাপত্তা ব্যবস্থা' : 'Security Overview')}
                  className="hover:text-gray-300 transition"
                >
                  {isBn ? 'নিরাপত্তা' : 'Security'}
                </a>
              </div>
            </div>

          </div>
        </footer>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          11. PROPERTY / MODULE QUICK-VIEW MODAL
      ───────────────────────────────────────────────────────────── */}
      {quickViewModule && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
          onClick={() => setQuickViewModule(null)}
        >
          <div
            className="modal-enter bg-[#16171a] border border-white/15 rounded-md max-w-2xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div className="relative h-64 sm:h-80 bg-[#1c1d21]">
              <Image
                src={quickViewModule.imageUrl}
                alt={quickViewModule.title}
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                className="object-cover object-top"
              />
              <button
                onClick={() => setQuickViewModule(null)}
                aria-label="Close dialog"
                className="btn-press absolute top-4 right-4 w-9 h-9 rounded-full bg-[#111214]/80 text-white hover:bg-[#12664F] hover:text-white flex items-center justify-center transition shadow-md border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute bottom-4 left-4 bg-[#111214]/90 text-[#10B981] text-xs font-semibold px-3 py-1 rounded border border-[#10B981]/30">
                {isBn ? quickViewModule.badgeBn : quickViewModule.badge}
              </span>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {isBn ? quickViewModule.titleBn : quickViewModule.title}
                </h3>
                <span className="text-xl font-extrabold text-[#2DC2BD]">
                  {isBn ? quickViewModule.highlightMetricBn : quickViewModule.highlightMetric}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {isBn ? quickViewModule.descriptionBn : quickViewModule.descriptionEn}
              </p>

              {/* Live Preview Box */}
              <div className="bg-[#111214] p-3 rounded border border-white/10 text-xs font-mono text-gray-200">
                <span className="text-xs font-medium text-gray-400 block mb-1">
                  {isBn ? 'সিস্টেম আউটপুট প্রিভিউ' : 'Live Output Preview'}
                </span>
                <span className="text-[#10B981] font-semibold">
                  {isBn ? quickViewModule.sampleUiSnippetBn : quickViewModule.sampleUiSnippetEn}
                </span>
              </div>

              {/* Specs Bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 py-3 border-y border-white/10">
                {(isBn ? quickViewModule.specsBn : quickViewModule.specs).map((spec, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{spec}</span>
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setQuickViewModule(null)}
                  className="px-4 py-2.5 rounded bg-[#1c1d21] hover:bg-[#24262b] border border-white/15 text-xs font-semibold text-white transition"
                >
                  {isBn ? 'বন্ধ করুন' : 'Close'}
                </button>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded bg-[#12664F] hover:bg-[#0E513F] text-white font-bold text-xs transition flex items-center gap-2 border border-[#10B981]/40 shadow-sm"
                >
                  <span>{isBn ? 'ব্যবহার শুরু করুন' : 'Activate Module'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#10B981]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          12. CONSULTATION / INQUIRY MODAL
      ───────────────────────────────────────────────────────────── */}
      {isConsultationOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
          onClick={() => setIsConsultationOpen(false)}
        >
          <div
            className="modal-enter bg-[#16171a] border border-white/15 rounded-md max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {isBn ? 'বাড়িওয়ালাদের জন্য পরামর্শ ও ডেমো' : 'Private Landlord Advisory'}
              </h3>
              <button
                onClick={() => setIsConsultationOpen(false)}
                aria-label="Close modal"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              {isBn
                ? 'আপনার বাড়ি বা ফ্ল্যাটের তথ্য দিন। আমাদের প্রতিনিধি সরাসরি আপনার সাথে যোগাযোগ করে সম্পূর্ণ বিনামূল্যে সিস্টেম সেটআপে সহায়তা করবে।'
                : 'Leave your details below and our team will guide you through system setup and WhatsApp receipt dispatch.'}
            </p>

            <form onSubmit={handleConsultationSubmit} className="space-y-3 text-xs">
              <div>
                <label htmlFor="consult-name" className="block text-gray-300 mb-1 font-medium">
                  {isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'} *
                </label>
                <input
                  id="consult-name"
                  type="text"
                  required
                  value={consultName}
                  onChange={(e) => setConsultName(e.target.value)}
                  placeholder={isBn ? 'প্রকৌশলী রফিকুল ইসলাম' : 'Rafiqul Islam'}
                  className="w-full bg-[#1c1d21] border border-white/15 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label htmlFor="consult-phone" className="block text-gray-300 mb-1 font-medium">
                  {isBn ? 'মোবাইল নম্বর (হোয়াটসঅ্যাপ)' : 'Mobile Phone (WhatsApp)'} *
                </label>
                <input
                  id="consult-phone"
                  type="tel"
                  required
                  value={consultPhone}
                  onChange={(e) => setConsultPhone(e.target.value)}
                  placeholder="+880 1700-000000"
                  className="w-full bg-[#1c1d21] border border-white/15 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="consult-units" className="block text-gray-300 mb-1 font-medium">
                    {isBn ? 'ফ্ল্যাট / ইউনিট সংখ্যা' : 'Units Count'}
                  </label>
                  <select
                    id="consult-units"
                    value={consultUnits}
                    onChange={(e) => setConsultUnits(e.target.value)}
                    className="w-full bg-[#1c1d21] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-[#10B981] cursor-pointer"
                  >
                    <option value="1–5">1–5 Flats</option>
                    <option value="6–10">6–10 Flats</option>
                    <option value="11–15+">11–15+ Flats</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="consult-location" className="block text-gray-300 mb-1 font-medium">
                    {isBn ? 'এলাকা' : 'Location'}
                  </label>
                  <select
                    id="consult-location"
                    value={consultLocation}
                    onChange={(e) => setConsultLocation(e.target.value)}
                    className="w-full bg-[#1c1d21] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-[#10B981] cursor-pointer"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Other">Other District</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#12664F] hover:bg-[#0E513F] text-white font-bold rounded transition mt-2 shadow-lg shadow-[#12664F]/30 border border-[#10B981]/40"
              >
                {isBn ? 'অনুরোধ পাঠান →' : 'Request Landlord Demo →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          13. FLOATING TOAST NOTIFICATION
      ───────────────────────────────────────────────────────────── */}
      <div
        id="toast"
        className={`fixed bottom-5 right-5 z-50 bg-[#16171a] border border-[#10B981] text-white text-xs px-4 py-3 rounded shadow-2xl flex items-center gap-2.5 transition-[opacity,transform] duration-300 ${floatingToast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
        <span>{floatingToast.message}</span>
      </div>
    </div>
  );
}
