'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ShieldCheck } from 'lucide-react';
import { SupportedLocale } from './landing-types';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitInquiry: (data: { name: string; phone: string; units: string; location: string }) => void;
  locale: SupportedLocale;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  onSubmitInquiry,
  locale,
}) => {
  const isBn = locale === 'bn';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [units, setUnits] = useState('1–5');
  const [location, setLocation] = useState('Dhaka');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    onSubmitInquiry({ name, phone, units, location });
    setName('');
    setPhone('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
      onClick={onClose}
    >
      <div
        className="modal-enter bg-[#16171a] border border-white/15 rounded-md max-w-md w-full p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base sm:text-lg font-bold text-white">
            {isBn ? 'বাড়িওয়ালাদের জন্য পরামর্শ ও ডেমো' : 'Landlord Walkthrough & Onboarding'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="btn-press text-gray-400 hover:text-white active:scale-95 p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          {isBn
            ? 'আপনার বাড়ি বা ফ্ল্যাটের তথ্য দিন। আমাদের প্রতিনিধি সরাসরি আপনার সাথে যোগাযোগ করে সম্পূর্ণ বিনামূল্যে সিস্টেম সেটআপে সহায়তা করবে।'
            : 'Enter your contact details and our landlord support team will guide you through system setup and WhatsApp receipt dispatch.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label htmlFor="consult-name" className="block text-gray-300 mb-1 font-medium">
              {isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'} *
            </label>
            <input
              id="consult-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isBn ? 'প্রকৌশলী রফিকুল ইসলাম' : 'Rafiqul Islam'}
              className="w-full bg-[#1c1d21] border border-white/15 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#10b981] focus-visible:ring-1 focus-visible:ring-[#10b981]"
            />
          </div>

          <div>
            <label htmlFor="consult-phone" className="block text-gray-300 mb-1 font-medium">
              {isBn ? 'ফোন নম্বর / হোয়াটসঅ্যাপ' : 'Phone / WhatsApp'} *
            </label>
            <input
              id="consult-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1700-000000"
              className="w-full bg-[#1c1d21] border border-white/15 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#10b981] focus-visible:ring-1 focus-visible:ring-[#10b981] tabular-nums"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="consult-units" className="block text-gray-300 mb-1 font-medium">
                {isBn ? 'ইউনিট সংখ্যা' : 'Units Count'}
              </label>
              <select
                id="consult-units"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full bg-[#1c1d21] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-[#10b981] focus-visible:ring-1 focus-visible:ring-[#10b981]"
              >
                <option value="1–5">{isBn ? '১–৫টি ফ্ল্যাট' : '1–5 Flats'}</option>
                <option value="6–10">{isBn ? '৬–১০টি ফ্ল্যাট' : '6–10 Flats'}</option>
                <option value="11–15">{isBn ? '১১–১৫টি ফ্ল্যাট' : '11–15 Flats'}</option>
                <option value="15+">{isBn ? '১৫+ ফ্ল্যাট' : '15+ Units'}</option>
              </select>
            </div>

            <div>
              <label htmlFor="consult-location" className="block text-gray-300 mb-1 font-medium">
                {isBn ? 'এলাকা' : 'Location'}
              </label>
              <select
                id="consult-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#1c1d21] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-[#10b981] focus-visible:ring-1 focus-visible:ring-[#10b981]"
              >
                <option value="Dhaka">{isBn ? 'ঢাকা' : 'Dhaka'}</option>
                <option value="Chattogram">{isBn ? 'চট্টগ্রাম' : 'Chattogram'}</option>
                <option value="Sylhet">{isBn ? 'সিলেট' : 'Sylhet'}</option>
                <option value="Other">{isBn ? 'অন্যান্য' : 'Other'}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span>
              {isBn ? 'আপনার তথ্য শতভাগ নিরাপদ ও গোপনীয় থাকবে।' : 'Your information is 100% confidential and secure.'}
            </span>
          </div>

          <button
            type="submit"
            className="btn-press w-full py-2.5 bg-[#12664F] hover:bg-[#0E513F] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white border border-[#10b981]/40 font-bold rounded transition-colors flex items-center justify-center gap-2 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
          >
            <span>{isBn ? 'ডেমোর অনুরোধ সম্পন্ন করুন' : 'Request Walkthrough'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

