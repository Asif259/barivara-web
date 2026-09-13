'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, Loader2 } from 'lucide-react';
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

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <DialogTitle className="text-lg font-semibold text-slate-900 truncate max-w-[70%]">
            {title || t.imagePreview}
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={isEn ? 'Close' : 'বন্ধ করুন'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full h-[calc(90vh-60px)] flex items-center justify-center bg-slate-50 overflow-hidden">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 text-slate-600">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm">{isEn ? 'Loading image...' : 'ছবি লোড হচ্ছে...'}</p>
            </div>
          )}

          {hasError && (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm">{t.imageLoadError}</p>
            </div>
          )}

          {imageUrl && !isLoading && !hasError && (
            <img
              src={imageUrl}
              alt={title || ''}
              onLoad={handleLoad}
              onError={handleError}
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          )}

          {!imageUrl && !isLoading && !hasError && (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm">{t.noImageAvailable}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}