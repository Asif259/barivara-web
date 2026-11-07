'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/stores/language-store';
import {
  Building2,
  FileText,
  MessageCircle,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Hallmark Stamp                                                             */
/* -------------------------------------------------------------------------- */
/* Hallmark · redesign: full · hero: stage · genre: editorial · Bengali Landlord Ledger */

type Lang = 'bn' | 'en';
type ActiveTab = 'ledger' | 'receipt';

interface HeroCopy {
  eyebrow: string;
  title: [string, string];
  lead: string;
  primaryCta: string;
  secondaryCta: string;
  microProof: string[];
  tabLedger: string;
  tabReceipt: string;
  propertyTitle: string;
  propertyMeta: string;
  collectionSummary: { label: string; amount: string; rate: string };
  units: Array<{
    id: string;
    flat: string;
    tenant: string;
    rent: string;
    status: 'paid' | 'pending';
    method?: string;
    dueDays?: string;
  }>;
  receiptPreview: {
    voucherTitle: string;
    receiptNo: string;
    date: string;
    tenantLabel: string;
    tenantName: string;
    flatLabel: string;
    flatName: string;
    periodLabel: string;
    periodValue: string;
    amountLabel: string;
    amountValue: string;
    methodLabel: string;
    methodValue: string;
    verifiedStamp: string;
    printAction: string;
    whatsappAction: string;
  };
}

const HERO_COPY: Record<Lang, HeroCopy> = {
  bn: {
    eyebrow: 'বাড়িওয়ালাদের জন্য বাংলা-প্রথম প্ল্যাটফর্ম',
    title: ['কাগজের খাতা থেকে', 'পরিষ্কার ডিজিটাল খতিয়ানে'],
    lead: 'একাধিক বাড়ি, ইউনিট আর ভাড়াটিয়ার হিসাব—সব এক জায়গায়। স্বয়ংক্রিয় মাসিক বিল, প্রিন্ট-রেডি রসিদ আর পেমেন্ট ট্র্যাকিং, বাংলায় আপনার নিজের হাতে।',
    primaryCta: 'বিনামূল্যে শুরু করুন',
    secondaryCta: 'লগ ইন করুন',
    microProof: ['১০০% ফ্রি পাবলিক বেটা', 'কোনো কার্ড লাগবে না', 'প্রিন্ট-রেডি A4 রসিদ'],
    tabLedger: 'মাসিক খতিয়ান',
    tabReceipt: 'মানি রসিদ ভাউচার',
    propertyTitle: 'গ্রিন ভ্যালি অ্যাপার্টমেন্ট, ধানমন্ডি',
    propertyMeta: 'মোট ৮টি ফ্ল্যাট · ৭টি ভাড়া দেওয়া · ১টি খালি',
    collectionSummary: { label: 'চলতি মাসের আদায়', amount: '৳১,১৮,৫০০', rate: '৮৮% সম্পন্ন' },
    units: [
      {
        id: 'u1',
        flat: 'ফ্ল্যাট ৪-বি',
        tenant: 'মোঃ রফিকুল ইসলাম',
        rent: '৳২২,০০০',
        status: 'paid',
        method: 'bKash মারফত',
      },
      {
        id: 'u2',
        flat: 'ফ্ল্যাট ৩-এ',
        tenant: 'ড. তারেক মাহমুদ',
        rent: '৳১৮,৫০০',
        status: 'pending',
        dueDays: '৩ দিন বাকি',
      },
      {
        id: 'u3',
        flat: 'ফ্ল্যাট ২-সি',
        tenant: 'তানভীর হাসান',
        rent: '৳১৬,০০০',
        status: 'paid',
        method: 'ব্যাংক ট্রান্সফার',
      },
    ],
    receiptPreview: {
      voucherTitle: 'বাড়িভাড়া আদায় রসিদ',
      receiptNo: 'রসিদ নং: BV-2026-084',
      date: 'তারিখ: ০৫ নভেম্বর, ২০২৬',
      tenantLabel: 'ভাড়াটিয়ার নাম',
      tenantName: 'মোঃ রফিকুল ইসলাম',
      flatLabel: 'ফ্ল্যাট / ইউনিট',
      flatName: 'ফ্ল্যাট ৪-বি (৪র্থ তলা)',
      periodLabel: 'ভাড়ার মাস',
      periodValue: 'নভেম্বর ২০২৬',
      amountLabel: 'পরিশোধিত মোট ভাড়া',
      amountValue: '৳২২,০০০',
      methodLabel: 'পেমেন্ট মাধ্যম',
      methodValue: 'বিকাশ (TrxID: 9J4K2L8)',
      verifiedStamp: 'পরিশোধিত ও সিলমোহরকৃত',
      printAction: 'A4 রসিদ প্রিন্ট',
      whatsappAction: 'হোয়াটসঅ্যাপে পাঠান',
    },
  },
  en: {
    eyebrow: 'Bangla-first property & rent ledger',
    title: ['From paper khatas', 'to a crystal clear ledger'],
    lead: 'Manage buildings, units, and tenant ledgers in one calm place. Automatic monthly bills, print-ready receipts, and instant WhatsApp reminders.',
    primaryCta: 'Start free today',
    secondaryCta: 'Sign in',
    microProof: ['100% Free Public Beta', 'No credit card needed', 'Print-ready A4 receipts'],
    tabLedger: 'Monthly Ledger',
    tabReceipt: 'Rent Receipt Voucher',
    propertyTitle: 'Green Valley Apartments, Dhanmondi',
    propertyMeta: '8 Units · 7 Occupied · 1 Vacant',
    collectionSummary: { label: 'Collected this month', amount: '৳118,500', rate: '88% collected' },
    units: [
      {
        id: 'u1',
        flat: 'Flat 4-B',
        tenant: 'Md. Rafiqul Islam',
        rent: '৳22,000',
        status: 'paid',
        method: 'via bKash',
      },
      {
        id: 'u2',
        flat: 'Flat 3-A',
        tenant: 'Dr. Tareq Mahmud',
        rent: '৳18,500',
        status: 'pending',
        dueDays: '3 days left',
      },
      {
        id: 'u3',
        flat: 'Flat 2-C',
        tenant: 'Tanvir Hassan',
        rent: '৳16,000',
        status: 'paid',
        method: 'Bank Transfer',
      },
    ],
    receiptPreview: {
      voucherTitle: 'Rent Payment Receipt',
      receiptNo: 'Receipt #: BV-2026-084',
      date: 'Date: Nov 05, 2026',
      tenantLabel: 'Tenant Name',
      tenantName: 'Md. Rafiqul Islam',
      flatLabel: 'Unit',
      flatName: 'Flat 4-B (4th Floor)',
      periodLabel: 'Rental Period',
      periodValue: 'November 2026',
      amountLabel: 'Total Rent Paid',
      amountValue: '৳22,000',
      methodLabel: 'Payment Channel',
      methodValue: 'bKash (TrxID: 9J4K2L8)',
      verifiedStamp: 'Verified & paid',
      printAction: 'Print A4 Receipt',
      whatsappAction: 'Send via WhatsApp',
    },
  },
};

export default function Hero() {
  const lang = useLanguage();
  const t = HERO_COPY[lang as Lang] || HERO_COPY.bn;
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<ActiveTab>('ledger');

  return (
    <section
      id="hero"
      aria-label={t.eyebrow}
      className="relative isolate min-h-[92svh] overflow-x-clip bg-hero-bg text-hero-text pt-24 pb-16 lg:pt-32 lg:pb-24"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          
          {/* Left Column: Direct Editorial Value Proposition */}
          <div className="lg:col-span-6 xl:col-span-6">
            {/* Untracked Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-hero-mint/20 bg-hero-mint/[0.08] px-3.5 py-1.5 text-xs font-medium text-hero-mint">
              <span className="h-1.5 w-1.5 rounded-full bg-hero-mint" />
              <span>{t.eyebrow}</span>
            </div>

            {/* Display Headline */}
            <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-hero-text sm:text-4xl lg:text-5xl font-serif">
              <span className="block">{t.title[0]}</span>
              <span className="mt-1.5 block text-hero-mint font-semibold">
                {t.title[1]}
              </span>
            </h1>

            {/* Credible, Balanced Lead */}
            <p
              className={`mt-6 max-w-[560px] text-pretty text-sm text-hero-muted sm:text-base ${
                isBn ? 'leading-relaxed' : 'leading-normal'
              }`}
            >
              {t.lead}
            </p>

            {/* Tangible CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-hero-mint px-7 text-sm font-semibold text-hero-bg transition-colors duration-150 active:scale-[0.98] hover:bg-hero-mint-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero-mint focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg"
              >
                <span>{t.primaryCta}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] px-7 text-sm font-semibold text-hero-text transition-colors duration-150 active:scale-[0.98] hover:border-white/40 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg"
              >
                {t.secondaryCta}
              </Link>
            </div>

            {/* Micro-Proof Elements */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-hero-subtext">
              {t.microProof.map((item, idx) => (
                <div key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-hero-mint" />
                  <span>{item}</span>
                  {idx < t.microProof.length - 1 && (
                    <span className="ml-3 hidden text-white/20 sm:inline">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: High-Craft Live Product Ledger & Voucher Preview */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="rounded-2xl border border-white/10 bg-hero-panel p-4 sm:p-6 ring-1 ring-white/5">
              
              {/* Product Header & Tab Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-hero-mint" />
                    <h3 className="text-sm font-semibold text-hero-text">{t.propertyTitle}</h3>
                  </div>
                  <p className="mt-0.5 text-xs text-hero-subtext">{t.propertyMeta}</p>
                </div>

                {/* Tactile Tab Selector */}
                <div className="inline-flex rounded-lg border border-white/10 bg-black/30 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ledger')}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero-mint ${
                      activeTab === 'ledger'
                        ? 'bg-hero-mint font-semibold text-hero-bg'
                        : 'text-hero-subtext hover:text-white'
                    }`}
                  >
                    {t.tabLedger}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('receipt')}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero-mint ${
                      activeTab === 'receipt'
                        ? 'bg-hero-mint font-semibold text-hero-bg'
                        : 'text-hero-subtext hover:text-white'
                    }`}
                  >
                    {t.tabReceipt}
                  </button>
                </div>
              </div>

              {/* View 1: Digital Khata (Monthly Ledger View) */}
              {activeTab === 'ledger' && (
                <div className="mt-4 space-y-3">
                  {/* Summary Metric Ribbon */}
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs">
                    <span className="text-hero-subtext">{t.collectionSummary.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-hero-mint">
                        {t.collectionSummary.amount}
                      </span>
                      <span className="rounded-full bg-hero-mint/10 px-2 py-0.5 text-xs text-hero-mint">
                        {t.collectionSummary.rate}
                      </span>
                    </div>
                  </div>

                  {/* Units Ledger List */}
                  <div className="space-y-2">
                    {t.units.map((unit) => (
                      <div
                        key={unit.id}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs transition-colors hover:border-white/15 hover:bg-white/[0.05]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-hero-bg font-mono text-xs font-semibold text-hero-mint">
                            {unit.flat.split(' ')[1] || unit.flat}
                          </div>
                          <div>
                            <p className="font-medium text-hero-text">{unit.tenant}</p>
                            <p className="text-xs text-hero-subtext">
                              {unit.flat} {unit.method ? `· ${unit.method}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-mono text-sm font-semibold text-hero-text">{unit.rent}</p>
                          {unit.status === 'paid' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-hero-mint">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>পরিশোধিত</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
                              <Clock className="h-3 w-3" />
                              <span>{unit.dueDays || 'বকেয়া'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Strip */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-hero-subtext">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-hero-mint" />
                      <span>এনক্রিপ্ট করা নিরাপদ খতিয়ান</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('receipt')}
                      className="inline-flex items-center gap-1 text-hero-mint transition-colors hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hero-mint"
                    >
                      <span>রসিদের নমুনা দেখুন</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* View 2: High-Craft Physical Rent Receipt Voucher */}
              {activeTab === 'receipt' && (
                <div className="mt-4">
                  <div className="rounded-xl border border-hero-voucher-border bg-hero-paper p-4 text-hero-ink sm:p-5">
                    {/* Voucher Header */}
                    <div className="flex items-start justify-between border-b border-hero-voucher-border/60 pb-3">
                      <div>
                        <span className="text-xs font-medium text-hero-emerald">
                          BariVara verified
                        </span>
                        <h4 className="text-base font-bold text-hero-ink font-serif">
                          {t.receiptPreview.voucherTitle}
                        </h4>
                      </div>
                      <div className="text-right text-xs text-hero-subtext">
                        <p className="font-mono">{t.receiptPreview.receiptNo}</p>
                        <p>{t.receiptPreview.date}</p>
                      </div>
                    </div>

                    {/* Voucher Body Details */}
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-hero-subtext">{t.receiptPreview.tenantLabel}:</span>
                        <p className="font-semibold text-hero-ink">{t.receiptPreview.tenantName}</p>
                      </div>
                      <div>
                        <span className="text-hero-subtext">{t.receiptPreview.flatLabel}:</span>
                        <p className="font-semibold text-hero-ink">{t.receiptPreview.flatName}</p>
                      </div>
                      <div>
                        <span className="text-hero-subtext">{t.receiptPreview.periodLabel}:</span>
                        <p className="font-medium text-hero-ink">{t.receiptPreview.periodValue}</p>
                      </div>
                      <div>
                        <span className="text-hero-subtext">{t.receiptPreview.methodLabel}:</span>
                        <p className="font-medium text-hero-ink">{t.receiptPreview.methodValue}</p>
                      </div>
                    </div>

                    {/* Paid Voucher Amount Banner with Verified Stamp */}
                    <div className="mt-4 flex items-center justify-between rounded-lg border border-hero-emerald/20 bg-hero-emerald/[0.06] p-3">
                      <div>
                        <span className="text-xs text-hero-emerald font-medium">{t.receiptPreview.amountLabel}</span>
                        <p className="font-mono text-2xl font-bold text-hero-emerald">
                          {t.receiptPreview.amountValue}
                        </p>
                      </div>
                      <div className="rounded border-2 border-hero-emerald/60 px-2.5 py-1 text-center font-serif text-xs font-semibold text-hero-emerald rotate-[-3deg]">
                        {t.receiptPreview.verifiedStamp}
                      </div>
                    </div>

                    {/* Voucher Actions */}
                    <div className="mt-3.5 flex flex-wrap items-center justify-end gap-2 border-t border-hero-voucher-border/60 pt-3 text-xs">
                      <span className="mr-auto inline-flex items-center gap-1 text-xs text-hero-subtext">
                        <FileText className="h-3.5 w-3.5 text-hero-emerald" />
                        <span>A4 প্রিন্ট ফরম্যাটে তৈরি</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-hero-ink/20 bg-white px-3 py-1.5 font-medium text-hero-ink shadow-xs transition-colors duration-150 active:scale-[0.98] hover:bg-hero-paper-hover disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hero-emerald"
                      >
                        <Printer className="h-3.5 w-3.5 text-hero-emerald" />
                        <span>{t.receiptPreview.printAction}</span>
                      </button>
                      <a
                        href="https://wa.me/?text=%E0%A6%AD%E0%A6%BE%E0%A7%9Calla%20%E0%A6%B0%E0%A6%B8%E0%A6%BF%E0%A6%A6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-hero-emerald px-3 py-1.5 font-medium text-white shadow-xs transition-colors duration-150 active:scale-[0.98] hover:bg-hero-emerald-dark focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hero-emerald"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-hero-mint" />
                        <span>{t.receiptPreview.whatsappAction}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
