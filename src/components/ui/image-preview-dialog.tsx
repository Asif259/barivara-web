'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Loader2, ImageOff } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  title?: string;
}

export function ImagePreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  title,
}: ImagePreviewDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (open && imageUrl) {
      setIsLoading(true);
      setHasError(false);
    } else {
      setIsLoading(false);
      setHasError(false);
    }
  }, [open, imageUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[calc(100%-2rem)]
          max-w-5xl
          h-auto
          max-h-[90vh]
          p-0
          overflow-hidden
          bg-white
          border-slate-200
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-200 shrink-0">
          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900 truncate">
            {title || t.imagePreview}
          </DialogTitle>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="
              shrink-0
              w-9 h-9
              flex items-center justify-center
              rounded-lg
              text-slate-500
              hover:text-slate-900
              hover:bg-slate-100
              transition-colors
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              focus:ring-offset-2
            "
            aria-label={isEn ? 'Close preview' : 'প্রিভিউ বন্ধ করুন'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Area */}
        <div
          className="
            relative
            flex
            items-center
            justify-center
            w-full
            min-h-[300px]
            max-h-[calc(90vh-64px)]
            p-4
            sm:p-6
            bg-slate-50
            overflow-auto
          "
        >
          {/* Loading */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />

              <p className="mt-3 text-sm text-slate-500">
                {isEn ? 'Loading image...' : 'ছবি লোড হচ্ছে...'}
              </p>
            </div>
          )}

          {/* Error */}
          {hasError && (
            <div className="flex flex-col items-center justify-center text-center px-6 py-12">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <ImageOff className="w-8 h-8 text-amber-500" />
              </div>

              <p className="text-sm font-medium text-slate-700">
                {t.imageLoadError}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {isEn
                  ? 'The image could not be loaded.'
                  : 'ছবিটি লোড করা সম্ভব হয়নি।'}
              </p>
            </div>
          )}

          {/* No Image */}
          {!imageUrl && !hasError && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center px-6 py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ImageOff className="w-8 h-8 text-slate-400" />
              </div>

              <p className="text-sm font-medium text-slate-600">
                {t.noImageAvailable}
              </p>
            </div>
          )}

          {/* Image */}
          {imageUrl && (
            <img
              key={imageUrl}
              src={imageUrl}
              alt={title || 'Image preview'}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`
                block
                max-w-full
                max-h-[calc(90vh-112px)]
                w-auto
                h-auto
                object-contain
                rounded-lg
                shadow-sm
                transition-opacity
                duration-200
                ${isLoading || hasError ? 'opacity-0' : 'opacity-100'}
              `}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}