'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service if configured
    console.error('Unhandled BariVara application error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#060807] text-[#F2F5F4] flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#12664F] selection:text-white">
      {/* Ambient background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#EF4444]/15 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full bg-[#12664F]/20 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* Error Icon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs font-semibold text-[#EF4444] backdrop-blur-md">
          <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
          <span>ত্রুটি ঘটেছে · SOMETHING WENT WRONG</span>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে
          </h1>
          <p className="text-sm sm:text-base text-[#9AA5A1] max-w-md mx-auto leading-relaxed">
            সিস্টেমে সাময়িক সমস্যা দেখা দিয়েছে। আপনার ডেটা সম্পূর্ণ নিরাপদ রয়েছে। পৃষ্ঠাটি রিফ্রেশ করুন অথবা মূল মেন্যুতে ফিরে যান।
          </p>
          <p className="text-xs text-gray-500 font-mono">
            An unexpected error occurred. Your data is safe. Please try refreshing or return to the home page.
          </p>
          {error?.digest && (
            <p className="text-[11px] text-gray-500 font-mono pt-1">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#0B2B22] bg-white hover:bg-gray-100 transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#12664F]" />
            <span>আবার চেষ্টা করুন (Try Again)</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-md active:scale-95"
          >
            <Home className="w-4 h-4 text-[#2DC2BD]" />
            <span>হোমে যান (Home)</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-white/10 text-xs text-gray-500">
          <p>BariVara (বাড়িভাড়া) · কারিগরি সহায়তা: support@barivara.app</p>
        </div>
      </div>
    </main>
  );
}
