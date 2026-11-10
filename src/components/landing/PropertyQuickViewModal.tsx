'use client';

import React from 'react';
import Image from 'next/image';
import { X, Heart, ArrowRight, Bed, Bath, Maximize2, Car } from 'lucide-react';
import { PropertyItem, SupportedLocale } from './landing-types';

interface PropertyQuickViewModalProps {
  property: PropertyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: PropertyItem) => void;
  isSaved: boolean;
  onScheduleInquiry: (property: PropertyItem) => void;
  locale: SupportedLocale;
}

export const PropertyQuickViewModal: React.FC<PropertyQuickViewModalProps> = ({
  property,
  isOpen,
  onClose,
  onSave,
  isSaved,
  onScheduleInquiry,
  locale,
}) => {
  if (!isOpen || !property) return null;

  const isBn = locale === 'bn';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="modal-enter bg-[#16171a] border border-white/15 rounded-md max-w-2xl w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Image Header */}
        <div className="relative h-64 sm:h-80 bg-[#1c1d21]">
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, 680px"
            className="object-cover"
          />
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="btn-press absolute top-4 right-4 w-9 h-9 rounded-full bg-[#111214]/85 text-white hover:bg-[#d9ff43] hover:text-[#111214] flex items-center justify-center transition-colors shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="absolute bottom-4 left-4 bg-[#111214]/90 text-[#d9ff43] text-xs font-semibold px-3 py-1 rounded border border-white/10 backdrop-blur-sm">
            {isBn ? property.locationBn : property.location}
          </span>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xl font-bold text-white">
              {isBn ? property.titleBn : property.title}
            </h3>
            <span className="text-xl font-extrabold text-[#d9ff43] tabular-nums">
              {isBn ? property.formattedPriceBn : property.formattedPriceBdt}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {isBn ? property.descriptionBn : property.descriptionEn}
          </p>

          {/* Key Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-400 py-3 border-y border-white/10 tabular-nums">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[#d9ff43]" />
              <span>{property.beds} {isBn ? 'বেডরুম' : 'Bedrooms'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-[#d9ff43]" />
              <span>{property.baths} {isBn ? 'বাথরুম' : 'Bathrooms'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-[#d9ff43]" />
              <span>{property.sqft.toLocaleString()} {isBn ? 'বর্গফুট' : 'Sqft'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Car className="w-4 h-4 text-[#d9ff43]" />
              <span>{property.parking} {isBn ? 'পার্কিং' : 'Parkings'}</span>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => onSave(property)}
              className="btn-press px-4 py-2.5 rounded bg-[#1c1d21] hover:bg-[#24262b] border border-white/15 text-xs font-semibold text-white flex items-center gap-2"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isSaved ? 'fill-[#d9ff43] text-[#d9ff43]' : 'text-gray-300'
                }`}
              />
              <span>
                {isSaved
                  ? isBn ? 'শর্টলিস্টে যুক্ত' : 'Saved to Shortlist'
                  : isBn ? 'শর্টলিস্টে রাখুন' : 'Save to Shortlist'}
              </span>
            </button>

            <button
              onClick={() => {
                onClose();
                onScheduleInquiry(property);
              }}
              className="btn-press px-5 py-2.5 rounded bg-[#d9ff43] hover:bg-[#c6f028] text-[#111214] font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <span>{isBn ? 'ইনকোয়ারি ও ভিজিট নির্ধারণ' : 'Schedule Property Visit'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

