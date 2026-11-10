'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Bed, Bath, Maximize2 } from 'lucide-react';
import { PropertyItem, SupportedLocale } from './landing-types';

interface LandingShowcaseProps {
  locale: SupportedLocale;
  properties: PropertyItem[];
  onSelectProperty: (property: PropertyItem) => void;
}

export const LandingShowcase: React.FC<LandingShowcaseProps> = ({
  locale,
  properties,
  onSelectProperty,
}) => {
  const isBn = locale === 'bn';

  if (!properties || properties.length === 0) {
    return (
      <section id="properties" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-14 max-w-6xl mx-auto text-center">
        <p className="text-gray-400 text-sm">
          {isBn ? 'কোনো প্রপার্টি পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।' : 'No properties matched your current filters. Please reset or adjust criteria.'}
        </p>
      </section>
    );
  }

  // Safe indexing for the 5 asymmetric positions
  const card1 = properties[0];
  const card2 = properties[1] || properties[0];
  const card3 = properties[2] || properties[0];
  const card4 = properties[3] || properties[0];
  const card5 = properties[4] || properties[0];

  return (
    <section id="properties" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-14 max-w-6xl mx-auto">
      {/* Section Heading */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d9ff43]" />
          <span>{isBn ? 'সেরা কালেকশন' : 'Featured Properties'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
          {isBn ? 'এই সপ্তাহের সেরা প্রপার্টি ডিল' : 'Awesome deal this week!'}
        </h2>
      </div>

      {/* 12-Column Staggered Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT + CENTER 8 COLUMNS */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* TOP SUB-ROW: Card 1 (Wider Left) + Card 2 (Compact Center) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* CARD 1: Top-Left Medium-Wide Villa */}
            {card1 && (
              <article
                onClick={() => onSelectProperty(card1)}
                className="prop-card md:col-span-7 group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[16/10] mb-3 border border-white/10">
                  <Image
                    src={card1.imageUrl}
                    alt={card1.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="prop-img object-cover transition-transform duration-500 ease-out"
                  />
                  <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded text-gray-200 border border-white/10 font-medium">
                    {isBn ? card1.locationBn : card1.location}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#d9ff43] transition-colors duration-150">
                    {isBn ? card1.titleBn : card1.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 tabular-nums">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-gray-400" />
                      {card1.beds} {isBn ? 'বেড' : 'Beds'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-gray-400" />
                      {card1.baths} {isBn ? 'বাথ' : 'Baths'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                      {card1.sqft.toLocaleString()} {isBn ? 'বর্গফুট' : 'sqft'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-white tabular-nums">
                      {isBn ? card1.formattedPriceBn : card1.formattedPriceBdt}
                    </span>
                    <button
                      aria-label={`View ${card1.title}`}
                      className="arrow-btn w-7 h-7 bg-[#d9ff43] text-[#111214] flex items-center justify-center rounded-sm transition-all duration-200"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* CARD 2: Top-Center Square Cantilevered Home */}
            {card2 && (
              <article
                onClick={() => onSelectProperty(card2)}
                className="prop-card md:col-span-5 md:mt-8 group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[4/3] mb-3 border border-white/10">
                  <Image
                    src={card2.imageUrl}
                    alt={card2.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="prop-img object-cover transition-transform duration-500 ease-out"
                  />
                  <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded text-gray-200 border border-white/10 font-medium">
                    {isBn ? card2.locationBn : card2.location}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#d9ff43] transition-colors duration-150">
                    {isBn ? card2.titleBn : card2.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 tabular-nums">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-gray-400" />
                      {card2.beds}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-gray-400" />
                      {card2.baths}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                      {card2.sqft.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-white tabular-nums">
                      {isBn ? card2.formattedPriceBn : card2.formattedPriceBdt}
                    </span>
                    <button
                      aria-label={`View ${card2.title}`}
                      className="arrow-btn w-7 h-7 bg-[#d9ff43] text-[#111214] flex items-center justify-center rounded-sm transition-all duration-200"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )}
          </div>

          {/* BOTTOM SUB-ROW: Card 4 (Compact Left Square) + Card 5 (Wider Center Dusk Villa) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* CARD 4: Bottom-Left Compact Coastal Box Home */}
            {card4 && (
              <article
                onClick={() => onSelectProperty(card4)}
                className="prop-card md:col-span-5 md:mt-6 group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[4/3] mb-3 border border-white/10">
                  <Image
                    src={card4.imageUrl}
                    alt={card4.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="prop-img object-cover transition-transform duration-500 ease-out"
                  />
                  <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded text-gray-200 border border-white/10 font-medium">
                    {isBn ? card4.locationBn : card4.location}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#d9ff43] transition-colors duration-150">
                    {isBn ? card4.titleBn : card4.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 tabular-nums">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-gray-400" />
                      {card4.beds}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-gray-400" />
                      {card4.baths}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                      {card4.sqft.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-white tabular-nums">
                      {isBn ? card4.formattedPriceBn : card4.formattedPriceBdt}
                    </span>
                    <button
                      aria-label={`View ${card4.title}`}
                      className="arrow-btn w-7 h-7 bg-[#d9ff43] text-[#111214] flex items-center justify-center rounded-sm transition-all duration-200"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* CARD 5: Bottom-Center Wide Dusk Residence */}
            {card5 && (
              <article
                onClick={() => onSelectProperty(card5)}
                className="prop-card md:col-span-7 group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[16/10] mb-3 border border-white/10">
                  <Image
                    src={card5.imageUrl}
                    alt={card5.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="prop-img object-cover transition-transform duration-500 ease-out"
                  />
                  <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded text-gray-200 border border-white/10 font-medium">
                    {isBn ? card5.locationBn : card5.location}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#d9ff43] transition-colors duration-150">
                    {isBn ? card5.titleBn : card5.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 tabular-nums">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-gray-400" />
                      {card5.beds} {isBn ? 'বেড' : 'Beds'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-gray-400" />
                      {card5.baths} {isBn ? 'বাথ' : 'Baths'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                      {card5.sqft.toLocaleString()} {isBn ? 'বর্গফুট' : 'sqft'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-white tabular-nums">
                      {isBn ? card5.formattedPriceBn : card5.formattedPriceBdt}
                    </span>
                    <button
                      aria-label={`View ${card5.title}`}
                      className="arrow-btn w-7 h-7 bg-[#d9ff43] text-[#111214] flex items-center justify-center rounded-sm transition-all duration-200"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            )}
          </div>
        </div>

        {/* RIGHT 4 COLUMNS: CARD 3 (Tall Vertical Showcase Card) */}
        {card3 && (
          <article
            onClick={() => onSelectProperty(card3)}
            className="prop-card lg:col-span-4 lg:-mt-4 group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-sm bg-[#1c1d21] aspect-[3/4.3] mb-3 border border-white/10">
              <Image
                src={card3.imageUrl}
                alt={card3.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="prop-img object-cover transition-transform duration-500 ease-out"
              />
              <span className="absolute top-3 left-3 bg-[#111214]/85 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded text-gray-200 border border-white/10 font-medium">
                {isBn ? card3.locationBn : card3.location}
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white group-hover:text-[#d9ff43] transition-colors duration-150">
                {isBn ? card3.titleBn : card3.title}
              </h3>
              <div className="flex items-center gap-4 text-[11px] text-gray-400 tabular-nums">
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-gray-400" />
                  {card3.beds} {isBn ? 'বেড' : 'Beds'}
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-gray-400" />
                  {card3.baths} {isBn ? 'বাথ' : 'Baths'}
                </span>
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                  {card3.sqft.toLocaleString()} {isBn ? 'বর্গফুট' : 'sqft'}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm font-bold text-white tabular-nums">
                  {isBn ? card3.formattedPriceBn : card3.formattedPriceBdt}
                </span>
                <button
                  aria-label={`View ${card3.title}`}
                  className="arrow-btn w-7 h-7 bg-[#d9ff43] text-[#111214] flex items-center justify-center rounded-sm transition-all duration-200"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
};

