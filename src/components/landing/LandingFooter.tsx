'use client';

import React, { useState } from 'react';
import { ArrowUpRight, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import { SupportedLocale } from './landing-types';

interface LandingFooterProps {
  locale: SupportedLocale;
  onShowToast: (msg: string) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ locale, onShowToast }) => {
  const isBn = locale === 'bn';
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubscribed(true);
    onShowToast(isBn ? 'সফলভাবে সাবস্ক্রাইব করা হয়েছে!' : 'Subscribed to BariVara Property Dispatch.');
  };

  return (
    <footer className="pt-16 pb-10 px-4 sm:px-8 lg:px-14 bg-[#121316] relative">
      <div className="max-w-6xl mx-auto">
        {/* Centered Large Geometric Logo + BariVara Wordmark */}
        <div className="flex flex-col items-center text-center mb-14">
          <svg className="w-16 h-14 text-[#d9ff43] mb-3" viewBox="0 0 28 24" fill="currentColor">
            <rect x="0" y="0" width="6" height="6" />
            <rect x="22" y="0" width="6" height="6" />
            <rect x="7" y="4" width="6" height="8" />
            <rect x="15" y="4" width="6" height="8" />
            <rect x="11" y="13" width="6" height="11" />
          </svg>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[0.22em] text-white">
            {isBn ? 'BARIVARA' : 'BARIVARA'}
          </h2>
          <p className="text-[11px] text-gray-400 max-w-md mt-2 leading-relaxed">
            {isBn
              ? 'বাংলাদেশের বাড়িওয়ালা ও প্রপার্টি মালিকদের জন্য আধুনিক, নির্ভরযোগ্য ও স্মার্ট ডিজিটাল ভাড়া ব্যবস্থাপনা প্ল্যাটফর্ম।'
              : 'Empowering residential & commercial property owners across Bangladesh with effortless digital rental ledgers, tenant verification, and instant WhatsApp receipts.'}
          </p>
        </div>

        {/* 3-Column Footer Links & Newsletter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10 text-xs">
          {/* Column 1: Menu */}
          <div className="lg:col-span-3 space-y-2.5">
            <h3 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
              {isBn ? 'মেন্যু' : 'Navigation'}
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#hero" className="hover:text-[#d9ff43] flex items-center gap-1.5 transition-colors">
                  <ArrowUpRight className="w-3 h-3 text-[#d9ff43]" />
                  <span>{isBn ? 'মূল পাতা' : 'Home'}</span>
                </a>
              </li>
              <li>
                <a href="#process" className="hover:text-[#d9ff43] flex items-center gap-1.5 transition-colors">
                  <ArrowUpRight className="w-3 h-3 text-[#d9ff43]" />
                  <span>{isBn ? 'কাজের পদ্ধতি' : 'How It Works'}</span>
                </a>
              </li>
              <li>
                <a href="#properties" className="hover:text-[#d9ff43] flex items-center gap-1.5 transition-colors">
                  <ArrowUpRight className="w-3 h-3 text-[#d9ff43]" />
                  <span>{isBn ? 'প্রপার্টি কালেকশন' : 'Properties'}</span>
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-[#d9ff43] flex items-center gap-1.5 transition-colors">
                  <ArrowUpRight className="w-3 h-3 text-[#d9ff43]" />
                  <span>{isBn ? 'বাড়িওয়ালাদের মতামত' : 'Landlord Stories'}</span>
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-[#d9ff43] flex items-center gap-1.5 transition-colors">
                  <ArrowUpRight className="w-3 h-3 text-[#d9ff43]" />
                  <span>{isBn ? 'সহায়িকা ও ব্লগ' : 'Blog'}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Office Address */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
              {isBn ? 'যোগাযোগ ও প্রধান কার্যালয়' : 'Headquarters & Support'}
            </h3>
            <p className="text-gray-400 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#d9ff43] shrink-0 mt-0.5" />
              <span>Gulshan Centre Point, Road 90, Gulshan-2, Dhaka 1212, Bangladesh</span>
            </p>
            <p className="text-gray-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#d9ff43] shrink-0" />
              <span>+880 1700-000000 / +880 2-9880000</span>
            </p>
            <p className="text-gray-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#d9ff43] shrink-0" />
              <span>support@barivara.com</span>
            </p>
          </div>

          {/* Column 3: Subscribe Newsletter */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
              {isBn ? 'নিউজলেটার সাবস্ক্রিপশন' : 'Subscribe Newsletter'}
            </h3>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              {isBn
                ? 'বাংলাদেশের ভাড়া নিয়ন্ত্রণ আইন, প্রপার্টি মূল্যবৃদ্ধি ও ইউটিলিটি গাইড নিয়মিত আপনার ইমেইলে পান।'
                : 'Receive quarterly Dhaka tenancy law updates, rental index reports, and utility management insights.'}
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center mt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isBn ? 'আপনার ইমেইল দিন...' : 'Enter your email...'}
                className="w-full bg-[#1c1d21] border border-white/15 rounded-l-sm px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d9ff43]"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="btn-press px-3.5 py-2.5 bg-[#d9ff43] hover:bg-[#c6f028] text-[#111214] font-bold rounded-r-sm transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </form>
            {isSubscribed && (
              <p className="text-[11px] text-[#d9ff43] flex items-center gap-1.5 mt-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isBn ? 'সাবস্ক্রিপশন সম্পন্ন হয়েছে।' : '✓ Subscribed to BariVara Dispatch.'}</span>
              </p>
            )}
          </div>
        </div>

        {/* Bottom Copyright & Legal Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} BariVara Technologies Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onShowToast(isBn ? 'গোপনীয়তা নীতি প্রদর্শিত' : 'Privacy Policy opened')}
              className="hover:text-gray-300 transition-colors"
            >
              {isBn ? 'গোপনীয়তা' : 'Privacy'}
            </button>
            <button
              onClick={() => onShowToast(isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service opened')}
              className="hover:text-gray-300 transition-colors"
            >
              {isBn ? 'শর্তাবলী' : 'Terms'}
            </button>
            <button
              onClick={() => onShowToast(isBn ? 'নিরাপত্তা ও এনক্রিপশন' : 'Security Overview')}
              className="hover:text-gray-300 transition-colors"
            >
              {isBn ? 'নিরাপত্তা' : 'Security'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
