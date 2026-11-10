'use client';

import React from 'react';
import Image from 'next/image';
import { ARTICLES } from './landing-data';
import { ArticleItem, SupportedLocale } from './landing-types';

interface LandingBlogProps {
  locale: SupportedLocale;
  onSelectArticle?: (article: ArticleItem) => void;
}

export const LandingBlog: React.FC<LandingBlogProps> = ({ locale, onSelectArticle }) => {
  const isBn = locale === 'bn';

  return (
    <section id="blog" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-14 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d9ff43]" />
          <span>{isBn ? 'সহায়িকা ও গাইড' : 'Insights & Journal'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
          {isBn ? 'বাড়িওয়ালাদের জন্য গুরুত্বপূর্ণ ব্লগ ও পরামর্শ' : 'Article & Blog posts'}
        </h2>
      </div>

      {/* 3 Staggered Blog Cards Matching Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-start">
        {ARTICLES.map((article, idx) => {
          const isSecond = idx === 1;
          const aspectClass = idx === 0 ? 'aspect-[4/3.4]' : idx === 1 ? 'aspect-[4/3]' : 'aspect-[4/2.9]';

          return (
            <article
              key={article.id}
              onClick={() => onSelectArticle?.(article)}
              className={`group cursor-pointer ${isSecond ? 'md:mt-6' : ''}`}
            >
              <div className={`relative overflow-hidden rounded-sm ${aspectClass} mb-4 border border-white/10 bg-[#1c1d21]`}>
                <Image
                  src={article.imageUrl}
                  alt={isBn ? article.titleBn : article.titleEn}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <span className="absolute top-3 left-3 bg-[#111214]/80 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2 py-0.5 rounded text-gray-200 border border-white/10 font-medium">
                  {isBn ? article.categoryBn : article.categoryEn}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#d9ff43] transition-colors leading-snug mb-2">
                {isBn ? article.titleBn : article.titleEn}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                {isBn ? article.excerptBn : article.excerptEn}
              </p>
              <div className="flex items-center gap-2.5 pt-3 border-t border-white/10">
                <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/20">
                  <Image
                    src={article.authorAvatar}
                    alt={article.author}
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
                <span className="text-[11px] text-gray-400">
                  {article.author} • {isBn ? article.readTimeBn : article.readTime}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

