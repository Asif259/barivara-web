import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#2DC2BD] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DC2BD] rounded-lg">
          <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-[#E5E7EB] bg-white transition-transform duration-200 group-hover:scale-102">
            <Image src="/icon.png" alt="BariVara" width={40} height={40} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#171717] tracking-tight">বাড়িভাড়া</span>
              <span className="text-xs font-semibold tracking-wider text-[#2DC2BD] uppercase bg-[#E8F3EF] px-1.5 py-0.5 rounded">BariVara</span>
            </div>
            <p className="text-xs text-[#6B7280]">স্মার্ট বাড়ি ও ডিজিটাল ভাড়া ব্যবস্থাপনা</p>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-xl border border-[#E5E7EB] shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
