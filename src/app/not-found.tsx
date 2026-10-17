import React from 'react';
import Link from 'next/link';
import { Home, LayoutDashboard, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#060807] text-[#F2F5F4] flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#12664F] selection:text-white">
      {/* Ambient background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#12664F]/20 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full bg-[#2DC2BD]/10 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[#2DC2BD] backdrop-blur-md">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
          <span>পৃষ্ঠা পাওয়া যায়নি · 404 NOT FOUND</span>
        </div>

        {/* Big Code */}
        <div className="space-y-3">
          <h1 className="text-7xl sm:text-8xl font-black tracking-tight text-white/90">
            ৪<span className="text-[#2DC2BD]">০</span>৪
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            কাঙ্ক্ষিত পাতাটি খুঁজে পাওয়া যায়নি
          </h2>
          <p className="text-sm sm:text-base text-[#9AA5A1] max-w-md mx-auto leading-relaxed">
            আপনি যে ঠিকানাটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা মুছে ফেলা হয়েছে। অনুগ্রহ করে সঠিক লিংক ব্যবহার করুন অথবা মূল পৃষ্ঠায় ফিরে যান।
          </p>
          <p className="text-xs text-gray-500 font-mono">
            The page you are looking for might have been moved, deleted, or does not exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#0B2B22] bg-white hover:bg-gray-100 transition-all shadow-lg active:scale-95"
          >
            <Home className="w-4 h-4 text-[#12664F]" />
            <span>হোমে ফিরে যান (Home)</span>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-md active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 text-[#2DC2BD]" />
            <span>ড্যাশবোর্ড (Dashboard)</span>
          </Link>
        </div>

        {/* Support Note */}
        <div className="pt-6 border-t border-white/10 text-xs text-gray-500">
          <p>BariVara (বাড়িভাড়া) · স্মার্ট বাড়ি ও ভাড়া ব্যবস্থাপনা প্ল্যাটফর্ম</p>
        </div>
      </div>
    </main>
  );
}
