'use client';

import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck } from 'lucide-react';
import { PropertyItem, SupportedLocale } from './landing-types';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty?: PropertyItem | null;
  onSubmitInquiry: (data: { name: string; phone: string; email: string; location: string }) => void;
  locale: SupportedLocale;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  selectedProperty,
  onSubmitInquiry,
  locale,
}) => {
  const isBn = locale === 'bn';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState(selectedProperty?.area || 'Gulshan-2');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    onSubmitInquiry({ name, phone, email, location });
    setName('');
    setPhone('');
    setEmail('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="modal-enter bg-[#16171a] border border-white/15 rounded-md max-w-md w-full p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d9ff43]" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {isBn ? 'প্রপার্টি ইনকোয়ারি ও পরামর্শ' : 'Private Tenancy Advisory'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="btn-press text-gray-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          {selectedProperty
            ? isBn
              ? `আপনি "${selectedProperty.titleBn}" সম্পর্কিত তথ্য ও পরিদর্শনের জন্য অনুরোধ জানাচ্ছেন।`
              : `Inquiring for: "${selectedProperty.title}" in ${selectedProperty.location}.`
            : isBn
            ? 'আপনার প্রয়োজনীয় তথ্য প্রদান করুন। আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করবে।'
            : 'Leave your contact details and our dedicated tenancy advisor will contact you.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-gray-300 mb-1 font-medium">
              {isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isBn ? 'মোঃ আশরাফুল আলম' : 'Tanvir Ahmed'}
              className="w-full bg-[#1c1d21] border border-white/15 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#d9ff43]"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1 font-medium">
              {isBn ? 'ফোন নম্বর / হোয়াটসঅ্যাপ' : 'Phone / WhatsApp'} *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1700-000000"
              className="w-full bg-[#1c1d21] border border-white/15 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#d9ff43] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1 font-medium">
              {isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full bg-[#1c1d21] border border-white/15 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#d9ff43]"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1 font-medium">
              {isBn ? 'পছন্দের এলাকা' : 'Preferred Location'}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#1c1d21] border border-white/15 rounded px-3 py-2 text-white focus:outline-none focus:border-[#d9ff43]"
            >
              <option value="Gulshan-2">Gulshan-2, Dhaka</option>
              <option value="Banani">Banani, Dhaka</option>
              <option value="Dhanmondi">Dhanmondi, Dhaka</option>
              <option value="Uttara">Uttara, Dhaka</option>
              <option value="Bashundhara">Bashundhara R/A, Dhaka</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d9ff43]" />
            <span>
              {isBn ? 'আপনার সকল তথ্য ১০০% সুরক্ষিত ও গোপনীয় থাকবে।' : 'Your contact details are encrypted and strictly confidential.'}
            </span>
          </div>

          <button
            type="submit"
            className="btn-press w-full py-2.5 bg-[#d9ff43] hover:bg-[#c6f028] text-[#111214] font-bold rounded transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <span>{isBn ? 'অনুরোধ সম্পন্ন করুন' : 'Submit Consultation Request'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

