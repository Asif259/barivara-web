'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Bookmark, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ProductModuleItem, SupportedLocale } from './landing-types';

interface ModuleQuickViewModalProps {
  module: ProductModuleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (module: ProductModuleItem) => void;
  isSaved: boolean;
  locale: SupportedLocale;
}

export const ModuleQuickViewModal: React.FC<ModuleQuickViewModalProps> = ({
  module,
  isOpen,
  onClose,
  onSave,
  isSaved,
  locale,
}) => {
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

  if (!isOpen || !module) return null;

  const isBn = locale === 'bn';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
      onClick={onClose}
    >
      <div
        className="modal-enter bg-[#16171a] border border-white/15 rounded-md max-w-2xl w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Image Header */}
        <div className="relative h-60 sm:h-72 bg-[#1c1d21]">
          <Image
            src={module.imageUrl}
            alt={module.title}
            fill
            sizes="(max-width: 768px) 100vw, 680px"
            className="object-cover"
          />
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="btn-press absolute top-4 right-4 w-9 h-9 rounded-full bg-[#111214]/85 text-white hover:bg-[#12664F] hover:text-white flex items-center justify-center transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="absolute bottom-4 left-4 bg-[#111214]/90 text-[#10b981] text-xs font-semibold px-3 py-1 rounded border border-[#10b981]/30">
            {isBn ? module.badgeBn : module.badge}
          </span>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xl font-bold text-white">
              {isBn ? module.titleBn : module.title}
            </h3>
            <span className="text-xs font-bold text-[#10b981] px-2.5 py-1 rounded bg-[#12664F]/20 border border-[#10b981]/30">
              {isBn ? module.highlightMetricBn : module.highlightMetric}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {isBn ? module.descriptionBn : module.descriptionEn}
          </p>

          {/* Sample Product UI Banner */}
          <div className="bg-[#111214] p-3 rounded border border-white/10 text-xs font-mono text-gray-200">
            <span className="text-xs font-medium text-gray-400 block mb-1">
              {isBn ? 'সিস্টেম আউটপুট নমুনা' : 'Live System Preview'}
            </span>
            <span className="text-[#10b981] font-semibold">
              {isBn ? module.sampleUiSnippetBn : module.sampleUiSnippetEn}
            </span>
          </div>

          {/* Key Product Capabilities */}
          <div className="space-y-2 py-2 border-y border-white/10">
            <span className="text-xs font-medium text-gray-400 block mb-1">
              {isBn ? 'সুবিধাসমূহ' : 'Key Capabilities'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
              {(isBn ? module.featuresBn : module.features).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => onSave(module)}
              className="btn-press px-4 py-2.5 rounded bg-[#1c1d21] hover:bg-[#24262b] border border-white/15 text-xs font-semibold text-white flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
            >
              <Bookmark
                className={`w-4 h-4 transition-colors ${
                  isSaved ? 'fill-[#10b981] text-[#10b981]' : 'text-gray-300'
                }`}
              />
              <span>
                {isSaved
                  ? isBn ? 'সংরক্ষিত' : 'Saved to Favorites'
                  : isBn ? 'বুকমার্ক করুন' : 'Save Feature'}
              </span>
            </button>

            <Link
              href="/register"
              className="btn-press px-5 py-2.5 rounded bg-[#12664F] hover:bg-[#0E513F] text-white font-bold text-xs flex items-center gap-2 shadow-md border border-[#10b981]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
            >
              <span>{isBn ? 'বিনামূল্যে ব্যবহার শুরু করুন' : 'Start Managing with BariVara'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#10b981]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


