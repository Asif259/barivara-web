import React from 'react';
import { Building2 } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/60 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-100/60 blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-bold text-slate-900 tracking-tight block">
              বাড়িভাড়া <span className="text-emerald-600 text-sm font-semibold">BariVara</span>
            </span>
            <span className="text-xs text-slate-500 block">স্মার্ট বাড়ি ও ভাড়া ব্যবস্থাপনা</span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
