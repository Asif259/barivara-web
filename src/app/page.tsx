'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguageHydrated, useLanguageStore, Language } from '@/stores/language-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';

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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col justify-between p-6 text-white relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* Top Brand */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 pt-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl overflow-hidden shrink-0 shadow-lg shadow-emerald-500/25">
            <Image src="/logo.png" alt="BariVara" width={44} height={44} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              বাড়িভাড়া <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">BariVara</span>
            </h1>
            <p className="text-xs text-slate-400">Smart Property & Rental Management</p>
          </div>
        </div>
      </div>

      {/* Center Language Choice Modal/Card */}
      <div className="w-full max-w-xl mx-auto my-auto z-10 py-12">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5" /> First Launch Setup
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            ভাষা নির্বাচন করুন <br />
            <span className="text-2xl font-medium text-slate-400">Select Your Language</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            আপনি পরবর্তীতে সেটিংস থেকে যেকোনো সময় ভাষা পরিবর্তন করতে পারবেন।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Bangla Option */}
          <button
            type="button"
            aria-pressed={selectedLang === 'bn'}
            onClick={() => setDraftLanguage('bn')}
            className={`relative rounded-2xl p-6 cursor-pointer border-2 transition-all duration-200 bg-slate-800/80 backdrop-blur-md hover:bg-slate-800 ${
              selectedLang === 'bn'
                ? 'border-emerald-500 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10'
                : 'border-slate-700/80 hover:border-slate-600'
            }`}
          >
            {selectedLang === 'bn' && (
              <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xs">
                <Check className="h-4 w-4 stroke-[3]" />
              </div>
            )}
            <div className="text-3xl mb-3">🇧🇩</div>
            <h3 className="text-xl font-bold text-white mb-1">বাংলা</h3>
            <p className="text-xs text-slate-400">বাংলাদেশী বাড়িওয়ালা ও ভাড়াটিয়াদের জন্য সম্পূর্ণ বাংলায় ব্যবস্থাপনা</p>
          </button>

          {/* English Option */}
          <button
            type="button"
            aria-pressed={selectedLang === 'en'}
            onClick={() => setDraftLanguage('en')}
            className={`relative rounded-2xl p-6 cursor-pointer border-2 transition-all duration-200 bg-slate-800/80 backdrop-blur-md hover:bg-slate-800 ${
              selectedLang === 'en'
                ? 'border-emerald-500 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10'
                : 'border-slate-700/80 hover:border-slate-600'
            }`}
          >
            {selectedLang === 'en' && (
              <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xs">
                <Check className="h-4 w-4 stroke-[3]" />
              </div>
            )}
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="text-xl font-bold text-white mb-1">English</h3>
            <p className="text-xs text-slate-400">Manage properties, units, and collections in English</p>
          </button>
        </div>

        <Button
          onClick={handleContinue}
          size="lg"
          variant="gradient"
          className="w-full text-base font-semibold py-6 rounded-2xl gap-2 shadow-lg shadow-emerald-600/30"
        >
          {selectedLang === 'bn' ? 'এগিয়ে যান' : 'Continue'}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl mx-auto text-center text-xs text-slate-500 z-10 pb-4 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>BariVara Rental Management System &bull; Secure & Encrypted</span>
      </div>
    </div>
  );
}