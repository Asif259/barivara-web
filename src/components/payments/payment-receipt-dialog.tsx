'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiResponse, Payment } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { formatCurrency, formatBnDate } from '@/lib/utils';
import { getFileDownloadUrl } from '@/lib/file-upload';
import {
  buildReceiptWhatsAppText,
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
  CheckCircle2,
  Download,
  Loader2,
  Copy,
  Check,
  Share2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

/**
 * Clean SVG icon for WhatsApp branding
 */
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

interface PaymentReceiptDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CANONICAL_RECEIPT_WIDTH = 600;

export function PaymentReceiptDialog({
  payment,
  open,
  onOpenChange,
}: PaymentReceiptDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);

  // WhatsApp popup-blocked fallback dialog state
  const [fallbackOpen, setFallbackOpen] = React.useState(false);
  const [fallbackData, setFallbackData] = React.useState<{
    waUrl: string;
    messageText: string;
    phone: string;
    tenantName: string;
    popupBlocked?: boolean;
  } | null>(null);

  const receiptRef = React.useRef<HTMLDivElement>(null);

  // Detect Web Share API file-sharing support on this device (client-side only).
  const [canShareImageNatively, setCanShareImageNatively] = React.useState(false);
  React.useEffect(() => {
    setCanShareImageNatively(canShareFilesCapability());
  }, []);

  const { data: paymentDetails } = useQuery({
    queryKey: ['payment-receipt-details', payment?.id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${payment!.id}`);
      return response.data.data;
    },
    enabled: open && !!payment?.id,
  });

  const effectivePayment = paymentDetails || payment;
  const currentSignatureId = effectivePayment?.owner?.signatureFileId ?? null;

  const { data: signatureUrl } = useQuery({
    queryKey: ['payment-signature-url', effectivePayment?.id, currentSignatureId],
    queryFn: () => getFileDownloadUrl(currentSignatureId!),
    enabled: open && !!currentSignatureId,
    retry: false,
  });

  if (!payment || !effectivePayment) return null;

  const monthlyRent = effectivePayment.monthlyRent;
  const agreement = monthlyRent?.agreement;
  const tenant = agreement?.tenant;
  const unit = agreement?.unit;
  const property = unit?.property;

  const tenantName = tenant?.name?.trim() || '';
  const rawPhone = tenant?.phone || '';
  const phoneResult = validateAndNormalizePhone(rawPhone);
  const hasValidPhone = phoneResult.isValid;

  const toBnNum = (num: number | string) => {
    if (isEn) return num.toString();
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d)]);
  };

  const translatePaymentMethod = (method: string) => {
    if (isEn) return method;
    const methods: Record<string, string> = {
      CASH: 'ক্যাশ',
      BANK: 'ব্যাংক',
      MFS: 'মোবাইল ব্যাংকিং (MFS)',
      BKASH: 'বিকাশ',
      NAGAD: 'নগদ',
      ROCKET: 'রকেট',
    };
    return methods[method?.toUpperCase()] || method;
  };

  /**
   * Generates a high-res PNG image from the receipt DOM element
   */
  const generateReceiptImage = async (): Promise<{
    dataUrl: string;
    blob: Blob;
    file: File;
    filename: string;
  }> => {
    if (!receiptRef.current) {
      throw new Error('Receipt DOM element not found');
    }

    const dataUrl = await toPng(receiptRef.current, {
      quality: 1,
      pixelRatio: 2, // Crisp 2x retina export
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true, // Prevents SecurityError from cross-origin Google Fonts CSS
    });

    console.log(`[Receipt Export Verification] Canonical Width: ${CANONICAL_RECEIPT_WIDTH}px, Exported Image generated successfully.`);

    const unitNum = unit?.unitNumber || 'Rent';
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'];
    const monthNum = monthlyRent?.month;
    const monthStr = typeof monthNum === 'number' && monthNum >= 1 && monthNum <= 12
      ? monthNames[monthNum - 1]
      : (monthNum || 'Month');
    const year = monthlyRent?.year || 'Year';
    const filename = `BariVara_Receipt_${unitNum}_${monthStr}_${year}.png`;

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: 'image/png' });

    return { dataUrl, blob, file, filename };
  };

  /**
   * Downloads receipt image to client
   */
  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);
      const { dataUrl, filename } = await generateReceiptImage();

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      toast.success(isEn ? 'Receipt image downloaded successfully!' : 'মানি রিসিট ইমেজ ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('Failed to export receipt image:', error);
      toast.error(t.receiptGenFailed || (isEn ? 'Failed to download receipt image' : 'রশিদ ইমেজ ডাউনলোড ব্যর্থ হয়েছে'));
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * PRIMARY: "Send to WhatsApp"
   *
   * Opens the EXACT tenant WhatsApp chat via wa.me deep-link.
   * NO navigator.share() — no Android "Send to..." sheet.
   * Works the same on mobile and desktop.
   *
   * Mobile: WhatsApp app opens to the specific tenant chat.
   * Desktop: WhatsApp Web opens to the specific tenant chat.
   *
   * NOTE: This does NOT attach the receipt image. The browser cannot
   * reliably attach a locally generated image AND open a specific
   * WhatsApp chat simultaneously. Use the "Share Image" button for
   * image sharing via the native share sheet.
   */
  const handleSendToWhatsApp = () => {
    if (!hasValidPhone) {
      toast.error(
        isEn
          ? 'Tenant does not have a WhatsApp number.'
          : 'ভাড়াটিয়ার কোনো হোয়াটসঅ্যাপ নম্বর নেই।'
      );
      return;
    }

    const messageText = buildReceiptWhatsAppText({
      tenantName,
      unitNumber: unit?.unitNumber || '',
      month: monthlyRent?.month,
      year: monthlyRent?.year,
      amount: effectivePayment.amount,
      isEn,
    });

    const waUrl = getWhatsAppShareUrl(phoneResult.normalizedPhone, messageText);

    let opened: Window | null = null;
    try {
      opened = window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('[WhatsApp] window.open failed:', e);
    }

    const popupBlocked = !opened || opened.closed || typeof opened.closed === 'undefined';

    if (popupBlocked) {
      // Popup was blocked — show fallback dialog with manual "Open WhatsApp" button
      setFallbackData({
        waUrl,
        messageText,
        phone: phoneResult.normalizedPhone,
        tenantName: tenantName || (isEn ? 'Tenant' : 'ভাড়াটিয়া'),
        popupBlocked: true,
      });
      setFallbackOpen(true);
    } else {
      toast.success(
        isEn
          ? `WhatsApp chat opened for ${tenantName || phoneResult.normalizedPhone}`
          : `${tenantName || phoneResult.normalizedPhone}-এর হোয়াটসঅ্যাপ চ্যাট খোলা হয়েছে`
      );
    }
  };

  /**
   * SECONDARY (optional): "Share Receipt Image"
   *
   * Only shown on devices/browsers that support navigator.share({ files }).
   * Generates the receipt image and invokes the native share sheet so the
   * user can select any app (including WhatsApp) to share the image to.
   *
   * This is intentionally SEPARATE from handleSendToWhatsApp because
   * the native share sheet cannot target a specific WhatsApp contact.
   */
  const handleShareReceiptImage = async () => {
    try {
      setIsSharing(true);

      const messageText = buildReceiptWhatsAppText({
        tenantName,
        unitNumber: unit?.unitNumber || '',
        month: monthlyRent?.month,
        year: monthlyRent?.year,
        amount: effectivePayment.amount,
        isEn,
      });

      const { file } = await generateReceiptImage();

      await navigator.share({
        files: [file],
        title: isEn ? 'Rent Payment Receipt' : 'ভাড়া পরিশোধের রশিদ',
        text: messageText,
      });

      toast.success(
        isEn ? 'Receipt image shared!' : 'রশিদ ইমেজ শেয়ার হয়েছে!'
      );
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Failed to share receipt image:', err);
        toast.error(
          isEn ? 'Failed to share receipt image' : 'রশিদ শেয়ার করতে সমস্যা হয়েছে'
        );
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Button Label
  const getButtonText = () => {
    if (isSharing) {
      return t.sendingReceipt || (isEn ? 'Preparing...' : 'প্রস্তুত হচ্ছে...');
    }
    if (hasValidPhone && tenantName) {
      return isEn ? `Send to ${tenantName}` : `${tenantName}-কে পাঠান`;
    }
    if (!hasValidPhone) {
      return isEn ? 'Choose WhatsApp Contact' : 'হোয়াটসঅ্যাপে পাঠান';
    }
    return isEn ? 'Send in WhatsApp' : 'হোয়াটসঅ্যাপে পাঠান';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl p-0 bg-white max-h-[92vh] flex flex-col overflow-hidden rounded-xl shadow-2xl border border-stone-300">
          {/* Scrollable Receipt Body — overflow-auto so fixed-width receipt scrolls on narrow screens */}
          <div className="overflow-auto flex-1 bg-stone-100/70 p-4 sm:p-7">
            {/*
             * CANONICAL RECEIPT ELEMENT
             * Fixed width at all times so preview === download === WhatsApp image.
             * No responsive (sm:) classes inside this element.
             */}
            <div
              ref={receiptRef}
              id="printable-receipt"
              className="space-y-5 bg-white border border-stone-300 shadow-sm"
              style={{ width: CANONICAL_RECEIPT_WIDTH, padding: '28px' }}
            >
              {/* Header */}
              <div className="border-y-[3px] border-emerald-800 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded">
                      <Image src="/logo.png" alt="BariVara" width={44} height={44} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h2 className="font-serif text-[22px] font-bold text-slate-950 tracking-tight leading-tight">
                        {property?.name || 'বাড়িভাড়া (BariVara)'}
                      </h2>
                      {property?.address && (
                        <p className="text-[11px] text-slate-600 leading-tight mt-1">{property.address}</p>
                      )}
                      <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-[0.18em] mt-1.5">
                        {isEn ? 'Official Money Receipt' : 'ভাড়া আদায়ের মানি রিসিট'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="inline-block text-[10px] px-2 py-1 bg-emerald-800 text-white font-bold tracking-[0.14em]"
                      style={{ backgroundColor: '#065f46', color: '#ffffff' }}
                    >
                      {isEn ? 'PAID / সম্পন্ন' : 'পরিশোধিত'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-2 font-mono">
                      {isEn ? 'Receipt No.' : 'রশিদ নং'} #{effectivePayment.id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tenant and unit details */}
              <div
                className="grid grid-cols-2 divide-x divide-stone-300 border-y border-stone-300 text-xs"
              >
                <div className="space-y-1 py-3 pr-4">
                  <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-[0.12em] block">
                    {isEn ? 'Tenant Information:' : 'ভাড়াটিয়ার তথ্য:'}
                  </span>
                  <span className="font-semibold text-slate-950 text-sm block">
                    {tenantName || (isEn ? 'Tenant' : 'ভাড়াটিয়া')}
                  </span>
                  <div className="flex items-center gap-1 text-slate-600 text-[11px]">
                    {/* Phone number only — no WhatsApp badge inside the receipt */}
                    <span>{rawPhone ? toBnNum(rawPhone) : '-'}</span>
                  </div>
                </div>
                <div className="text-right space-y-1 py-3 pl-4">
                  <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-[0.12em] block">
                    {isEn ? 'Unit & Property:' : 'ইউনিট ও বাড়ি:'}
                  </span>
                  <span className="font-semibold text-slate-950 text-sm block">
                    {unit ? `${isEn ? 'Unit' : 'ইউনিট'} ${toBnNum(unit.unitNumber)}` : '-'}
                  </span>
                  <span className="text-slate-600 text-[11px] block">
                    {property?.name}
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown Table */}
              <div className="border border-stone-300 overflow-hidden text-xs">
                <div
                  className="bg-stone-100 px-4 py-2.5 border-b border-stone-300 flex justify-between items-center text-[10px] font-bold text-stone-700 uppercase tracking-[0.16em]"
                >
                  <span>{isEn ? 'Description' : 'বিবরণ'}</span>
                  <span>{isEn ? 'Amount' : 'পরিমাণ'}</span>
                </div>

                <div className="divide-y divide-stone-200 bg-white">
                  {/* Rent Period */}
                  <div className="px-4 py-2.5 flex justify-between text-slate-700">
                    <span>{isEn ? 'Rent Period' : 'ভাড়ার মাস ও সাল'}:</span>
                    <span className="font-semibold text-slate-950 font-mono">
                      {monthlyRent ? `${toBnNum(monthlyRent.month)}/${toBnNum(monthlyRent.year)}` : '-'}
                    </span>
                  </div>

                  {monthlyRent && (
                    <>
                      <div className="px-4 py-2 flex justify-between text-slate-700">
                        <span>{isEn ? 'Base Rent' : 'মূল ভাড়া'}:</span>
                        <span className="font-medium text-slate-900">{formatCurrency(monthlyRent.rent, language)}</span>
                      </div>

                      {monthlyRent.serviceFee > 0 && (
                        <div className="px-4 py-2 flex justify-between text-slate-700">
                          <span>{isEn ? 'Service Fee' : 'সার্ভিস চার্জ'}:</span>
                          <span className="font-medium text-slate-900">{formatCurrency(monthlyRent.serviceFee, language)}</span>
                        </div>
                      )}

                      {monthlyRent.parkingFee > 0 && (
                        <div className="px-4 py-2 flex justify-between text-slate-700">
                          <span>{isEn ? 'Parking Fee' : 'পার্কিং চার্জ'}:</span>
                          <span className="font-medium text-slate-900">{formatCurrency(monthlyRent.parkingFee, language)}</span>
                        </div>
                      )}

                      {monthlyRent.extraCharge > 0 && (
                        <div className="px-4 py-2 flex justify-between text-slate-700">
                          <span>{isEn ? 'Extra Charge' : 'অন্যান্য চার্জ'}:</span>
                          <span className="font-medium text-slate-900">{formatCurrency(monthlyRent.extraCharge, language)}</span>
                        </div>
                      )}

                      {monthlyRent.discount > 0 && (
                        <div className="px-4 py-2 flex justify-between text-emerald-800 font-medium">
                          <span>{isEn ? 'Discount' : 'ছাড়'}:</span>
                          <span>- {formatCurrency(monthlyRent.discount, language)}</span>
                        </div>
                      )}

                      <div
                        className="px-4 py-2.5 flex justify-between font-semibold text-slate-950 bg-stone-100"
                      >
                        <span>{isEn ? 'Total Monthly Bill' : 'মোট মাসিক বিল'}:</span>
                        <span>{formatCurrency(monthlyRent.totalAmount, language)}</span>
                      </div>
                    </>
                  )}

                  {/* Payment Details */}
                  <div className="px-4 py-2 flex justify-between text-slate-700">
                    <span>{isEn ? 'Payment Receiving Date' : 'টাকা গ্রহণের তারিখ'}:</span>
                    <span className="font-medium text-slate-900">{formatBnDate(effectivePayment.paymentDate, language)}</span>
                  </div>

                  <div className="px-4 py-2 flex justify-between text-slate-700">
                    <span>{t.paymentMethod}:</span>
                    <span className="font-medium text-slate-900">{translatePaymentMethod(effectivePayment.paymentMethod)}</span>
                  </div>

                  {effectivePayment.transactionId && (
                    <div className="px-4 py-2 flex justify-between text-slate-700">
                      <span>{t.transactionId}:</span>
                      <span className="font-mono text-slate-900 font-medium">{toBnNum(effectivePayment.transactionId)}</span>
                    </div>
                  )}

                  {monthlyRent && (
                    <div className="px-4 py-2 flex justify-between text-slate-700">
                      <span>{isEn ? 'Remaining Due' : 'অবশিষ্ট বকেয়া'}:</span>
                      <span className={`font-bold ${monthlyRent.remainingAmount > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                        {formatCurrency(monthlyRent.remainingAmount, language)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Settlement — signature replaces the ✓ circle on the right */}
              <div
                className="flex items-center justify-between bg-emerald-50 px-4 py-3"
                style={{ backgroundColor: '#ecfdf5' }}
              >
                {/* Left: amount */}
                <div>
                  <span className="text-[10px] text-emerald-900 block font-bold uppercase tracking-[0.16em]">
                    {isEn ? 'Amount Paid (Received)' : 'পরিশোধিত টাকার পরিমাণ (প্রাপ্ত)'}
                  </span>
                  <span className="text-2xl font-bold text-emerald-950">
                    {formatCurrency(effectivePayment.amount, language)}
                  </span>
                </div>

                {/* Right: owner signature */}
                <div className="text-right text-xs text-slate-600 space-y-1 shrink-0">
                  {signatureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={signatureUrl}
                      alt={t.ownerSignature || (isEn ? 'Owner Signature' : 'মালিকের স্বাক্ষর')}
                      crossOrigin="anonymous"
                      className="h-7 ml-auto object-contain"
                      style={{ maxWidth: '9rem' }}
                    />
                  ) : null}
                  <div className="border-t border-stone-400 w-24 ml-auto" />
                  {effectivePayment.owner?.name && (
                    <span className="font-medium text-[11px] text-slate-800 block">
                      {effectivePayment.owner.name}
                    </span>
                  )}
                </div>
              </div>

              {effectivePayment.note && (
                <div className="text-xs bg-stone-50 px-3 py-2.5 border-l-2 border-stone-300 text-slate-700">
                  <span className="font-semibold text-slate-900">{t.note}:</span> {effectivePayment.note}
                </div>
              )}

              {/* Footer Note */}
              <div className="border-t border-stone-200 pt-3 text-center text-[10px] text-slate-500">
                {isEn
                  ? 'Thank you for your payment. This is an electronic receipt.'
                  : 'ভাড়া প্রদানের জন্য ধন্যবাদ। এটি একটি ইলেকট্রনিক রসিদ।'}
              </div>
            </div>
          </div>

          {/* Sticky Action Buttons Footer */}
          <DialogFooter className="p-3.5 px-4 sm:px-6 bg-stone-50 border-t border-stone-300 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {t.cancel}
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {/* Download: generates and saves the receipt image */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadImage}
                disabled={isDownloading || isSharing}
                className="gap-1.5 shadow-xs font-medium text-slate-700 hover:text-slate-900 border-stone-300 flex-1 sm:flex-none cursor-pointer"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <Download className="w-4 h-4 text-slate-600" />
                )}
                {isEn ? 'Download' : 'ডাউনলোড'}
              </Button>

              {/* Share Image: native share sheet for image (mobile only, when supported) */}
              {canShareImageNatively && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareReceiptImage}
                  disabled={isDownloading || isSharing}
                  className="gap-1.5 shadow-xs font-medium text-slate-700 hover:text-slate-900 border-stone-300 flex-1 sm:flex-none cursor-pointer"
                  title={isEn ? 'Share receipt image via native share sheet' : 'শেয়ার শিট দিয়ে রশিদ শেয়ার করুন'}
                >
                  {isSharing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  ) : (
                    <Share2 className="w-4 h-4 text-slate-600" />
                  )}
                  {isEn ? 'Share Image' : 'শেয়ার'}
                </Button>
              )}

              {/* Send to WhatsApp: opens EXACT tenant chat via wa.me deep-link */}
              <Button
                size="sm"
                onClick={handleSendToWhatsApp}
                disabled={isDownloading || isSharing}
                className="gap-2 shadow-xs font-semibold bg-[#25D366] hover:bg-[#20ba59] text-white border-0 transition-colors flex-1 sm:flex-none cursor-pointer"
                title={
                  hasValidPhone
                    ? `WhatsApp: ${phoneResult.normalizedPhone}`
                    : (isEn ? 'No WhatsApp number for this tenant' : 'ভাড়াটিয়ার হোয়াটসঅ্যাপ নম্বর নেই')
                }
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{getButtonText()}</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Share Guidance & Fallback Dialog */}
      <WhatsAppShareFallbackDialog
        open={fallbackOpen}
        onOpenChange={setFallbackOpen}
        data={fallbackData}
        isEn={isEn}
      />
    </>
  );
}

interface WhatsAppShareFallbackProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Only populated when a popup was blocked on desktop.
   * The fallback dialog shows a manual "Open WhatsApp" button.
   */
  data: {
    waUrl: string;
    messageText: string;
    phone: string;
    tenantName: string;
    popupBlocked?: boolean;
  } | null;
  isEn: boolean;
}

/**
 * Shown only when window.open() is blocked by the browser.
 * Provides a manual "Open WhatsApp" button and shows the prefilled message.
 */
function WhatsAppShareFallbackDialog({
  open,
  onOpenChange,
  data,
  isEn,
}: WhatsAppShareFallbackProps) {
  const [copiedText, setCopiedText] = React.useState(false);

  if (!data) return null;

  const handleCopyText = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(data.messageText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(data.waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-5 bg-white rounded-2xl shadow-2xl border border-slate-200">
        <DialogHeader className="space-y-1.5 pb-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shrink-0">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 leading-tight">
                {isEn ? `Send to ${data.tenantName}` : `${data.tenantName}-কে পাঠান`}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isEn ? `WhatsApp: ${data.phone}` : `নম্বর: ${data.phone}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Popup blocked warning */}
        {data.popupBlocked && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">
                {isEn ? 'Pop-up blocked by browser' : 'ব্রাউজার পপ-আপ ব্লক করেছে'}
              </span>
              <p className="text-[11px] text-amber-800">
                {isEn
                  ? 'Click "Open WhatsApp" below to open the exact tenant chat.'
                  : 'নিচের "হোয়াটসঅ্যাপ খুলুন" বাটনে চাপ দিয়ে সরাসরি চ্যাট খুলুন।'}
              </p>
            </div>
          </div>
        )}

        {/* Prefilled message preview */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
            <span>{isEn ? 'Prefilled message:' : 'প্রি-ফিলড মেসেজ:'}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyText}
              className="h-6 px-2 text-[11px] gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">{isEn ? 'Copied' : 'কপি হয়েছে'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Copy' : 'কপি'}</span>
                </>
              )}
            </Button>
          </div>
          <pre className="text-[11px] font-sans bg-slate-100 p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap text-slate-800 leading-relaxed">
            {data.messageText}
          </pre>
        </div>

        <DialogFooter className="pt-2 flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {isEn ? 'Close' : 'বন্ধ করুন'}
          </Button>
          <Button
            size="sm"
            onClick={handleOpenWhatsApp}
            className="gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            {isEn ? 'Open WhatsApp' : 'হোয়াটসঅ্যাপ খুলুন'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
