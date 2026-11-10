'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from './landing-data';
import { SupportedLocale } from './landing-types';

interface LandingTestimonialsProps {
  locale: SupportedLocale;
}

export const LandingTestimonials: React.FC<LandingTestimonialsProps> = ({ locale }) => {
  const isBn = locale === 'bn';
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = TESTIMONIALS.length;
  const current = TESTIMONIALS[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const formattedCurrent = String(currentIndex + 1).padStart(2, '0');
  const formattedTotal = String(total).padStart(2, '0');

  return (
    <section id="testimonials" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-16 max-w-6xl mx-auto">
      {/* Heading */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d9ff43]" />
          <span>{isBn ? 'সফল বাড়িওয়ালাদের গল্প' : 'Client Stories'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug">
          {isBn ? (
            <>সারা দেশের বাড়িওয়ালা ও প্রপার্টি মালিকদের<br />নির্ভরযোগ্য সঙ্গী</>
          ) : (
            <>Trusted by families &amp; landlords<br />across Bangladesh</>
          )}
        </h2>
      </div>

      {/* 2-Column Split Layout matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Portrait with Subtle Architectural Offset Backdrop */}
        <div className="md:col-span-5 relative">
          <div className="relative mx-auto max-w-xs">
            {/* Offset decorative backdrop */}
            <div className="absolute -left-4 -bottom-4 w-full h-full bg-[#1c1d21] border border-white/10 -z-10 rounded-sm" />

            <div className="relative overflow-hidden rounded-sm border border-white/15 bg-[#1c1d21] aspect-[4/4.6]">
              <Image
                src={current.imageUrl}
                alt={isBn ? current.nameBn : current.name}
                fill
                sizes="(max-width: 768px) 320px, 400px"
                className="object-cover object-top transition-opacity duration-300"
              />
            </div>

            <div className="mt-4">
              <h3 className="text-base font-bold text-white">
                {isBn ? current.nameBn : current.name}
              </h3>
              <p className="text-xs text-gray-400">
                {isBn ? current.roleBn : current.role}
              </p>
            </div>
          </div>
        </div>

        {/* Right Quote Content & Interactive Controls */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          {/* Opening Quote Icon */}
          <div className="text-4xl sm:text-5xl font-serif text-white/80 leading-none select-none">
            “
          </div>

          <div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-3">
              {isBn ? current.headlineBn : current.headlineEn}
            </h4>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed min-h-[90px]">
              &quot;{isBn ? current.quoteBn : current.quoteEn}&quot;
            </p>
          </div>

          {/* Closing Quote Icon */}
          <div className="text-4xl sm:text-5xl font-serif text-white/80 leading-none text-right select-none">
            ”
          </div>

          {/* Controls & Pagination Row */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Testimonial"
                className="btn-press w-9 h-9 rounded-sm bg-[#1c1d21] hover:bg-[#2e3138] border border-white/15 text-gray-300 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Testimonial"
                className="btn-press w-9 h-9 rounded-sm bg-[#d9ff43] hover:bg-[#c6f028] text-[#111214] flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400 font-mono tabular-nums">
              <span className="text-[#d9ff43] font-bold">{formattedCurrent}</span>
              <div className="w-12 h-[1px] bg-white/20" />
              <span>{formattedTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

