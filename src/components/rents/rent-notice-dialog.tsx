'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiResponse, MonthlyRent } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { formatCurrency, formatBnDate, formatNumber } from '@/lib/utils';
import { getFileDownloadUrl } from '@/lib/file-upload';
import {
  buildNoticeWhatsAppText,
  canShareFilesCapability,
  getWhatsAppShareUrl,
  validateAndNormalizePhone,
} from '@/lib/whatsapp-receipt';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Download,
  Loader2,
  Copy,
  Check,
  Share2,
  Printer,
  Calendar,
  Clock,
  User,
  Home,
  FileText,
  Building,
} from 'lucide-react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

export const CANONICAL_NOTICE_WIDTH = 600;

export function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.02 2.61c.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29" />
    </svg>
  );
}

interface RentNoticeDialogProps {
  rent: MonthlyRent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RentNoticeDialog({
  rent,
  open,
  onOpenChange,
}: RentNoticeDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const [scale, setScale] = React.useState(1);
  const [noticeHeight, setNoticeHeight] = React.useState<number | null>(null);

  const noticeRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);

  // Fetch complete details if rent is open
  const { data: rentDetails } = useQuery({
    queryKey: ['rent-notice-details', rent?.id],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<MonthlyRent>>(`/monthly-rents/${rent!.id}`);
      return res.data?.data;
    },
    enabled: open && !!rent?.id,
  });

  const effectiveRent = rentDetails || rent;
  const owner = effectiveRent?.agreement?.unit?.property?.owner;
  const signatureFileId = owner?.signatureFileId ?? null;

  const { data: signatureUrl } = useQuery({
    queryKey: ['rent-owner-signature-url', signatureFileId],
    queryFn: () => getFileDownloadUrl(signatureFileId!),
    enabled: open && !!signatureFileId,
    retry: false,
  });

  // Responsive scaling matching canonical width using measurement anchor
  React.useLayoutEffect(() => {
    if (!open) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        if (containerWidth > 0) {
          const newScale = Math.min(1, containerWidth / CANONICAL_NOTICE_WIDTH);
          setScale(newScale);
        }
      }
      if (noticeRef.current) {
        setNoticeHeight(noticeRef.current.offsetHeight);
      }
    };

    updateDimensions();

    const observer = new ResizeObserver(() => updateDimensions());
    if (containerRef.current) observer.observe(containerRef.current);
    if (noticeRef.current) observer.observe(noticeRef.current);

    window.addEventListener('resize', updateDimensions);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [open, effectiveRent]);

  if (!rent || !effectiveRent) return null;

  const agreement = effectiveRent.agreement;
  const tenant = agreement?.tenant;
  const unit = agreement?.unit;
  const property = unit?.property;

  const tenantName = tenant?.name?.trim() || '';
  const rawPhone = tenant?.phone || '';
  const phoneResult = validateAndNormalizePhone(rawPhone);

  const getMonthLabel = (m: number, y: number) => {
    const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthsBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    return isEn
      ? `${monthsEn[m - 1]} ${y}`
      : `${monthsBn[m - 1]} ${formatNumber(y, 'bn')}`;
  };

  const generateNoticeImage = async (): Promise<{
    dataUrl: string;
    blob: Blob;
    file: File;
    filename: string;
  }> => {
    if (!noticeRef.current) throw new Error('Notice DOM element not found');

    const node = noticeRef.current;

    // 1. Wait for document web fonts to complete loading
    if (typeof document !== 'undefined' && 'fonts' in document && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading check error:', e);
      }
    }

    // 2. Wait for images inside notice (e.g. owner signature) to load and decode
    const imgElements = Array.from(node.querySelectorAll('img'));
    await Promise.all(
      imgElements.map((img) => {
        if (img.complete) {
          return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
        }
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }),
    );

    // 3. Temporarily reset scroll to guarantee scroll-independent full capture
    const scrollContainer = scrollViewportRef.current;
    const prevScrollTop = scrollContainer?.scrollTop ?? 0;
    if (scrollContainer && prevScrollTop > 0) {
      scrollContainer.scrollTop = 0;
    }

    try {
      // 4. Measure exact full unscaled dimensions
      const targetWidth = CANONICAL_NOTICE_WIDTH;
      const targetHeight = Math.max(
        node.scrollHeight,
        node.offsetHeight,
        node.clientHeight,
        noticeHeight || 0,
        700
      );

      // 5. Generate high-resolution 2x retina PNG covering the complete document
      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true, // Prevents SecurityError from cross-origin CSS while preserving system font glyphs
        width: targetWidth,
        height: targetHeight,
        canvasWidth: targetWidth,
        canvasHeight: targetHeight,
        style: {
          transform: 'none',
          margin: '0',
          width: `${targetWidth}px`,
          height: `${targetHeight}px`,
          maxHeight: 'none',
          maxWidth: 'none',
        },
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const cleanUnit = (unit?.unitNumber || 'unit').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `rent-notice-${cleanUnit}-${effectiveRent.month}-${effectiveRent.year}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      return { dataUrl, blob, file, filename };
    } finally {
      // Restore scroll position
      if (scrollContainer && prevScrollTop > 0) {
        scrollContainer.scrollTop = prevScrollTop;
      }
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { dataUrl, filename } = await generateNoticeImage();
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      toast.success(isEn ? 'Rent notice downloaded successfully' : 'ভাড়ার নোটিশ সফলভাবে ডাউনলোড হয়েছে');
    } catch (err) {
      console.error('Download error:', err);
      toast.error(isEn ? 'Failed to download notice' : 'নোটিশ ডাউনলোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = async () => {
    setIsSharing(true);
    try {
      const text = buildNoticeWhatsAppText({
        tenantName,
        unitNumber: unit?.unitNumber,
        propertyName: property?.name,
        month: effectiveRent.month,
        year: effectiveRent.year,
        totalAmount: effectiveRent.totalAmount,
        paidAmount: effectiveRent.paidAmount,
        remainingAmount: effectiveRent.remainingAmount,
        dueDate: effectiveRent.dueDate,
        isEn,
      });

      const waUrl = getWhatsAppShareUrl(rawPhone, text);

      if (canShareFilesCapability()) {
        try {
          const { file } = await generateNoticeImage();
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: isEn ? 'Rent Payment Notice' : 'ভাড়ার নোটিশ',
              text,
            });
            toast.success(isEn ? 'Shared via device' : 'সফলভাবে শেয়ার করা হয়েছে');
            return;
          }
        } catch (e: any) {
          if (e.name === 'AbortError') return;
        }
      }

      // Fallback: Copy message text and open WhatsApp Web/App
      await navigator.clipboard.writeText(text);
      window.open(waUrl, '_blank');
      toast.success(
        isEn
          ? 'Notice text copied! Opening WhatsApp...'
          : 'নোটিশের লেখা কপি করা হয়েছে! হোয়াটসঅ্যাপ খোলা হচ্ছে...'
      );
    } catch (err) {
      console.error('Share error:', err);
      toast.error(isEn ? 'Failed to share notice' : 'নোটিশ শেয়ার করতে সমস্যা হয়েছে');
    } finally {
      setIsSharing(false);
    }
  };

  const remainingNum = Number(effectiveRent.remainingAmount);
  const paidNum = Number(effectiveRent.paidAmount);
  const totalNum = Number(effectiveRent.totalAmount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 bg-white max-h-[92vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-slate-200">
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-slate-100 shrink-0 print:hidden">
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5 text-emerald-600" />
            {isEn ? 'Monthly Rent Payment Notice' : 'মাসিক ভাড়ার নোটিশ ও পেমেন্ট অনুরোধ'}
          </DialogTitle>
          <DialogDescription>
            {isEn
              ? 'Official payment request notice for the tenant. Does not record payment or alter ledger balances.'
              : 'ভাড়াটিয়ার জন্য আনুষ্ঠানিক ভাড়া পরিশোধের অনুরোধ। এটি কোনো রশিদ নয় এবং এতে কোনো নতুন পেমেন্ট রেকর্ড হবে না।'}
          </DialogDescription>
        </DialogHeader>

        {/* Scaled Notice Document Preview inside vertically scrollable viewport */}
        <div
          ref={scrollViewportRef}
          className="overflow-y-auto overflow-x-hidden flex-1 bg-slate-100/70 p-3 sm:p-6 print:p-0 print:bg-white print:overflow-visible"
        >
          {/* Invisible measurement anchor to get available container width without interference */}
          <div ref={containerRef} className="w-full h-0 pointer-events-none" />

          {/* Scaled Preview Wrapper & Centering Box */}
          <div className="flex justify-center w-full min-h-full items-start print:block">
            <div
              className="relative shrink-0 transition-all duration-75 print:w-full print:h-auto"
              style={{
                width: Math.min(CANONICAL_NOTICE_WIDTH, CANONICAL_NOTICE_WIDTH * scale),
                height: noticeHeight ? Math.ceil(noticeHeight * scale) + 2 : 'auto',
                overflow: 'hidden',
              }}
            >
              {/* Scale transformation wrapper */}
              <div
                className="print:transform-none"
                style={{
                  width: `${CANONICAL_NOTICE_WIDTH}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                {/* 
                 * CANONICAL NOTICE DOCUMENT
                 * Fixed at 600px width with natural document height.
                 * Used identically for preview, PNG export, and printing.
                 */}
                <div
                  ref={noticeRef}
                  id="canonical-rent-notice"
                  className="bg-white text-slate-900 rounded-2xl shadow-md border border-slate-200/90 p-6 sm:p-8 select-none print:shadow-none print:border-none print:w-full print:p-0 print:rounded-none"
                  style={{
                    width: `${CANONICAL_NOTICE_WIDTH}px`,
                  }}
                >
                  {/* Header: BariVara branding + Document Type */}
                  <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                          বা
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-slate-900">
                          BariVara <span className="text-emerald-600 font-normal text-sm">বাড়িভাড়া</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {property?.name} • {property?.address || 'Bangladesh'}
                      </p>
                      {owner && (
                        <p className="text-xs text-slate-500">
                          {isEn ? 'Landlord' : 'মালিক'}: {owner.name} {owner.phone ? `(${owner.phone})` : ''}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {isEn ? 'Rent Payment Notice' : 'ভাড়া পরিশোধের নোটিশ'}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        {isEn ? 'Notice Date' : 'ইস্যুর তারিখ'}: {formatBnDate(effectiveRent.createdAt, language)}
                      </p>
                    </div>
                  </div>

                  {/* Notice Context Banner */}
                  <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        {isEn ? 'Rent Month' : 'ভাড়ার মাস'}
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {getMonthLabel(effectiveRent.month, effectiveRent.year)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        {isEn ? 'Payment Due Date' : 'পরিশোধের শেষ তারিখ'}
                      </span>
                      <span className="text-base font-bold text-rose-700">
                        {formatBnDate(effectiveRent.dueDate, language)}
                      </span>
                    </div>
                  </div>

                  {/* Tenant & Property Overview */}
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-sm">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        {isEn ? 'Billed To (Tenant)' : 'ভাড়াটিয়া'}
                      </span>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        {tenantName || 'Tenant'}
                      </p>
                      {rawPhone && <p className="text-xs text-slate-600 pl-5">{rawPhone}</p>}
                    </div>

                    <div className="space-y-1 text-right">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        {isEn ? 'Unit / Flat' : 'ফ্ল্যাট ও বাড়ি'}
                      </span>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5 justify-end">
                        <Home className="w-4 h-4 text-slate-400" />
                        {unit?.unitNumber}
                      </p>
                      <p className="text-xs text-slate-600">{property?.name}</p>
                    </div>
                  </div>

                  {/* Itemized Charges Table */}
                  <div className="py-4 space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1">
                      {isEn ? 'Itemized Charges' : 'ভাড়ার হিসাব ও বিবরণী'}
                    </h4>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">{isEn ? 'Monthly Base Rent' : 'মাসিক মূল ভাড়া'}</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(effectiveRent.rent, language)}</span>
                      </div>

                      {Number(effectiveRent.serviceFee) > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-600">{isEn ? 'Service Fee' : 'সার্ভিস চার্জ'}</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(effectiveRent.serviceFee, language)}</span>
                        </div>
                      )}

                      {Number(effectiveRent.parkingFee) > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-600">{isEn ? 'Parking Fee' : 'পার্কিং ফি'}</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(effectiveRent.parkingFee, language)}</span>
                        </div>
                      )}

                      {Number(effectiveRent.extraCharge) > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-600">{isEn ? 'Extra Charges' : 'অন্যান্য চার্জ'}</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(effectiveRent.extraCharge, language)}</span>
                        </div>
                      )}

                      {Number(effectiveRent.lateFee) > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                          <span>{isEn ? 'Late Fee' : 'বিলম্ব ফি'}</span>
                          <span className="font-semibold">+{formatCurrency(effectiveRent.lateFee, language)}</span>
                        </div>
                      )}

                      {Number(effectiveRent.discount) > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                          <span>{isEn ? 'Discount' : 'ডিসকাউন্ট'}</span>
                          <span className="font-semibold">-{formatCurrency(effectiveRent.discount, language)}</span>
                        </div>
                      )}

                      {/* Total Rent Bill */}
                      <div className="flex justify-between py-2 border-t-2 border-slate-200 text-base font-bold text-slate-900">
                        <span>{isEn ? 'Total Bill for Month' : 'এই মাসের মোট বিল'}</span>
                        <span>{formatCurrency(effectiveRent.totalAmount, language)}</span>
                      </div>

                      {/* Prior Payment Row */}
                      {paidNum > 0 && (
                        <div className="flex justify-between py-1 text-emerald-700 font-semibold">
                          <span>{isEn ? 'Paid So Far' : 'পূর্বে পরিশোধিত ভাড়া'}</span>
                          <span>-{formatCurrency(effectiveRent.paidAmount, language)}</span>
                        </div>
                      )}

                      {/* Outstanding Balance Highlight Box */}
                      <div className="mt-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-amber-900 uppercase tracking-wide block">
                            {isEn ? 'Total Balance Due' : 'সর্বমোট প্রদেয় বকেয়া'}
                          </span>
                          <span className="text-[11px] text-amber-700">
                            {remainingNum === 0
                              ? (isEn ? 'Fully paid. No payment required.' : 'সম্পূর্ণ পরিশোধিত। কোনো বকেয়া নেই।')
                              : (isEn ? 'Please pay before due date' : 'অনুগ্রহ করে শেষ তারিখের মধ্যে পরিশোধ করুন')}
                          </span>
                        </div>
                        <span className="text-2xl font-extrabold text-amber-900">
                          {formatCurrency(effectiveRent.remainingAmount, language)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Notice & Landlord Signature */}
                  <div className="mt-6 pt-5 border-t border-slate-200 flex items-end justify-between">
                    <div className="space-y-1 text-xs text-slate-500 max-w-[320px]">
                      <p className="font-semibold text-slate-700">
                        {isEn ? 'Payment Instructions:' : 'পেমেন্ট নির্দেশিকা:'}
                      </p>
                      <p>
                        {isEn
                          ? 'Please pay via Cash, bKash, Nagad, or Bank Transfer to the landlord directly before the deadline.'
                          : 'নির্ধারিত শেষ তারিখের মধ্যে নগদ, বিকাশ, নগদ অথবা ব্যাংক ট্রান্সফারের মাধ্যমে বাড়িওয়ালার নিকট ভাড়া পরিশোধ করুন।'}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      {signatureUrl ? (
                        <div className="h-12 w-32 relative mb-1 flex items-end justify-end">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={signatureUrl}
                            alt={isEn ? 'Owner Signature' : 'মালিকের স্বাক্ষর'}
                            crossOrigin="anonymous"
                            className="max-h-12 max-w-[8rem] object-contain object-bottom"
                          />
                        </div>
                      ) : (
                        <div className="h-10" />
                      )}
                      <div className="w-36 border-t border-slate-400 pt-1 text-center">
                        <span className="text-[11px] text-slate-600 font-medium block">
                          {isEn ? 'Authorized Signatory' : 'অনুরোধকারী / বাড়িওয়ালা'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {owner?.name || 'Landlord'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog Actions — Pinned Footer */}
        <DialogFooter className="p-4 sm:p-6 pt-3 border-t border-slate-100 shrink-0 bg-slate-50/50 flex-col sm:flex-row gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="w-4 h-4" />
            {isEn ? 'Print' : 'প্রিন্ট'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-2"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isEn ? 'Download Image' : 'ছবি ডাউনলোড'}
          </Button>

          <Button
            type="button"
            onClick={handleWhatsAppShare}
            disabled={isSharing}
            className="gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white"
          >
            {isSharing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <WhatsAppIcon className="w-4 h-4" />
            )}
            {isEn ? 'Share WhatsApp' : 'হোয়াটসঅ্যাপে পাঠান'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {isEn ? 'Close' : 'বন্ধ করুন'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
