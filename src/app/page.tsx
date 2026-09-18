'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguageHydrated, useLanguageStore, Language } from '@/stores/language-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { language, hasSelectedLanguage, setLanguage } = useLanguageStore();
  const languageHydrated = useLanguageHydrated();
  const { isAuthenticated } = useAuthStore();
  const [draftLanguage, setDraftLanguage] = useState<Language | null>(null);
  const selectedLang = draftLanguage || language;

  useEffect(() => {
    if (languageHydrated && hasSelectedLanguage) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [hasSelectedLanguage, isAuthenticated, languageHydrated, router]);

  if (!languageHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF9]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#12664F] border-t-transparent" />
      </div>
    );
  }

  const handleContinue = () => {
    setLanguage(selectedLang);
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 text-[#171717] selection:bg-[#12664F] selection:text-white">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 shadow-xs border border-[#E5E7EB] bg-white p-1">
            <Image
              src="/logo.png"
              alt="BariVara"
              width={48}
              height={48}
              className="w-full h-full object-cover rounded-lg"
              priority
            />
          </div>
          <div className="text-left">
            <span className="text-2xl font-bold text-[#171717] tracking-tight block">
              বাড়িভাড়া <span className="text-[#12664F] text-sm font-semibold">BariVara</span>
            </span>
            <span className="text-xs text-[#6B7280] block">স্মার্ট বাড়ি ও ভাড়া ব্যবস্থাপনা</span>
          </div>
        </div>
      </div>

      {/* Center Selection Card */}
      <div className="w-full max-w-md mx-auto my-auto px-0 py-8">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-2xl border border-[#E5E7EB]">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
              {selectedLang === 'bn' ? 'ভাষা নির্বাচন করুন' : 'Select Language'}
            </h2>
            <p className="text-sm text-[#6B7280] mt-1.5">
              {selectedLang === 'bn'
                ? 'আপনার পছন্দের ভাষা নির্বাচন করুন। পরবর্তীতে সেটিংস থেকে পরিবর্তন করা যাবে।'
                : 'Choose your preferred language. You can change this anytime in settings.'}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {/* Bangla Option */}
            <button
              type="button"
              role="radio"
              aria-checked={selectedLang === 'bn'}
              onClick={() => setDraftLanguage('bn')}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                selectedLang === 'bn'
                  ? 'border-[#12664F] bg-[#E8F3EF]/40 ring-1 ring-[#12664F]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#FAFAF9]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`flex items-center justify-center w-10 h-10 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                    selectedLang === 'bn'
                      ? 'bg-[#12664F] text-white'
                      : 'bg-[#F3F4F6] text-[#374151]'
                  }`}
                >
                  বাং
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#171717]">বাংলা</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">বাড়িওয়ালাদের জন্য সম্পূর্ণ বাংলায় ব্যবস্থাপনা</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  selectedLang === 'bn'
                    ? 'border-[#12664F] bg-[#12664F] text-white'
                    : 'border-[#D1D5DB] bg-white'
                }`}
              >
                {selectedLang === 'bn' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>

            {/* English Option */}
            <button
              type="button"
              role="radio"
              aria-checked={selectedLang === 'en'}
              onClick={() => setDraftLanguage('en')}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                selectedLang === 'en'
                  ? 'border-[#12664F] bg-[#E8F3EF]/40 ring-1 ring-[#12664F]'
                : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#FAFAF9]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`flex items-center justify-center w-10 h-10 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                    selectedLang === 'en'
                      ? 'bg-[#12664F] text-white'
                      : 'bg-[#F3F4F6] text-[#374151]'
                  }`}
                >
                  EN
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#171717]">English</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">Manage properties, units, and collections</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  selectedLang === 'en'
                    ? 'border-[#12664F] bg-[#12664F] text-white'
                    : 'border-[#D1D5DB] bg-white'
                }`}
              >
                {selectedLang === 'en' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          </div>

          <Button
            onClick={handleContinue}
            className="w-full bg-[#12664F] hover:bg-[#0E513F] text-white font-medium h-11 rounded-xl gap-2 shadow-xs cursor-pointer"
          >
            <span>{selectedLang === 'bn' ? 'এগিয়ে যান' : 'Continue'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="w-full max-w-md mx-auto text-center text-xs text-[#9CA3AF] py-2">
        © {new Date().getFullYear()} BariVara • স্মার্ট বাড়ি ও ভাড়া ব্যবস্থাপনা
      </div>
    </div>
  );
}