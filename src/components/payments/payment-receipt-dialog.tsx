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
  canShareFiles,
  getWhatsAppShareUrl,
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
import { CheckCircle2, Download, Loader2, Copy, Check } from 'lucide-react';
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

  // Desktop / unsupported share fallback state
  const [fallbackOpen, setFallbackOpen] = React.useState(false);
  const [fallbackData, setFallbackData] = React.useState<{
    filename: string;
    waUrl: string;
    messageText: string;
    phone: string;
  } | null>(null);

  const receiptRef = React.useRef<HTMLDivElement>(null);

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
   * Generates a high-res PNG from the receipt DOM element
   */
  const generateReceiptImage = async (): Promise<{
    dataUrl: string;
    file: File;
    filename: string;
  }> => {
    if (!receiptRef.current) {
      throw new Error('Receipt container element not found');
    }

    const dataUrl = await toPng(receiptRef.current, {
      quality: 1,
      pixelRatio: 2, // Crisp 2x retina export
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true, // Prevents SecurityError from cross-origin Google Fonts CSS
    });

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

    return { dataUrl, file, filename };
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
      toast.error(isEn ? 'Failed to download receipt image' : 'রসিদ ইমেজ ডাউনলোড ব্যর্থ হয়েছে');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Handles "Send Receipt" flow:
   * 1. Generates the receipt image.
   * 2. Builds localized WhatsApp text.
   * 3. On mobile / supported devices: opens native Web Share sheet with file attached.
   * 4. On desktop / unsupported devices: downloads image, opens WhatsApp Web with prefilled message,
   *    and presents desktop guidance dialog without pretending auto-file attachment is possible.
   */
  const handleSendReceipt = async () => {
    try {
      setIsSharing(true);

      const tenantName = tenant?.name || '';
      const unitNumber = unit?.unitNumber || '';
      const month = monthlyRent?.month;
      const year = monthlyRent?.year;
      const amount = effectivePayment.amount;
      const phone = tenant?.phone;

      const messageText = buildReceiptWhatsAppText({
        tenantName,
        unitNumber,
        month,
        year,
        amount,
        isEn,
      });

      const { dataUrl, file, filename } = await generateReceiptImage();

      // Check if browser supports Web Share API with files
      if (canShareFiles(file)) {
        try {
          await navigator.share({
            files: [file],
            title: isEn ? 'BariVara Payment Receipt' : 'বাড়িভাড়া পেমেন্ট রসিদ',
            text: messageText,
          });
          toast.success(
            t.receiptSharedSuccess || (isEn ? 'Receipt shared successfully!' : 'রসিদ সফলভাবে শেয়ার করা হয়েছে!')
          );
          return;
        } catch (shareErr: any) {
          if (shareErr?.name === 'AbortError') {
            // User cancelled/closed the native share sheet
            return;
          }
          console.warn('Native share error, switching to desktop fallback:', shareErr);
        }
      }

      // ── Desktop / Unsupported Browser Fallback ─────────────────────────────
      // Step 1: Auto-download the receipt image file
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      // Step 2: Build wa.me URL
      const waUrl = getWhatsAppShareUrl(phone, messageText);

      // Step 3: Open WhatsApp Web / App
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // Step 4: Copy message text to clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(messageText).catch(() => {});
      }

      // Step 5: Open helpful guidance modal
      setFallbackData({
        filename,
        waUrl,
        messageText,
        phone: phone || '',
      });
      setFallbackOpen(true);

      toast.success(
        t.receiptDownloadedForWhatsapp ||
          (isEn
            ? 'Receipt image downloaded! Please attach it in WhatsApp.'
            : 'রসিদ ইমেজ ডাউনলোড হয়েছে! হোয়াটসঅ্যাপ চ্যাটে রসিদটি যুক্ত করে পাঠিয়ে দিন।'),
        { duration: 5000 }
      );
    } catch (error) {
      console.error('Failed to prepare receipt for WhatsApp:', error);
      toast.error(
        t.whatsappShareFailed ||
          (isEn ? 'Failed to prepare receipt for sharing' : 'রসিদ শেয়ার করতে সমস্যা হয়েছে')
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl p-0 bg-white max-h-[92vh] flex flex-col overflow-hidden rounded-xl shadow-2xl border border-stone-300">
          {/* Scrollable Receipt Body */}
          <div className="overflow-y-auto flex-1 bg-stone-100/70 p-4 sm:p-7">
            <div ref={receiptRef} id="printable-receipt" className="space-y-5 bg-white p-5 sm:p-7 border border-stone-300 shadow-sm">
              {/* Header */}
              <div className="border-y-[3px] border-emerald-800 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded">
                      <Image src="/logo.png" alt="BariVara" width={44} height={44} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 tracking-tight leading-tight">
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
                      {isEn ? 'Receipt No.' : 'রসিদ নং'} #{effectivePayment.id.substring(0, 8).toUpperCase()}
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
                    {tenant?.name || 'Tenant'}
                  </span>
                  <span className="text-slate-600 text-[11px] block">
                    {tenant?.phone ? toBnNum(tenant.phone) : '-'}
                  </span>
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

              {/* Settlement */}
              <div
                className="flex items-center justify-between border-l-4 border-emerald-800 bg-emerald-50 px-4 py-3.5"
                style={{ backgroundColor: '#ecfdf5', borderColor: '#065f46' }}
              >
                <div>
                  <span className="text-[10px] text-emerald-900 block font-bold uppercase tracking-[0.16em]">
                    {isEn ? 'Amount Paid (Received)' : 'পরিশোধিত টাকার পরিমাণ (প্রাপ্ত)'}
                  </span>
                  <span className="font-serif text-2xl font-bold text-emerald-950">
                    {formatCurrency(effectivePayment.amount, language)}
                  </span>
                </div>
                <div
                  className="h-8 w-8 rounded-full bg-emerald-800 text-white flex items-center justify-center"
                  style={{ backgroundColor: '#065f46', color: '#ffffff' }}
                >
                  <CheckCircle2 className="w-5 h-5 text-white stroke-[2.2]" />
                </div>
              </div>

              {effectivePayment.note && (
                <div className="text-xs bg-stone-50 px-3 py-2.5 border-l-2 border-stone-300 text-slate-700">
                  <span className="font-semibold text-slate-900">{t.note}:</span> {effectivePayment.note}
                </div>
              )}

              {/* Signatures */}
              <div className="pt-2 grid grid-cols-1 text-xs text-slate-600">
                <div className="text-center space-y-1.5">
                  {signatureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={signatureUrl}
                      alt={t.ownerSignature || (isEn ? 'Owner Signature' : 'মালিকের স্বাক্ষর')}
                      crossOrigin="anonymous"
                      className="h-8 mx-auto object-contain"
                      style={{ maxWidth: '11rem' }}
                    />
                  ) : null}
                  <div className="border-t border-stone-500 w-44 mx-auto"></div>
                  <span className="font-semibold text-[10px] uppercase tracking-[0.12em] text-stone-700 block">
                    {t.ownerSignature || (isEn ? 'Owner Signature' : 'মালিকের স্বাক্ষর')}
                  </span>
                  {effectivePayment.owner?.name && (
                    <span className="font-medium text-[11px] text-slate-800 block">
                      {effectivePayment.owner.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer Note */}
              <div className="border-t border-stone-200 pt-3 text-center text-[10px] text-slate-500">
                {isEn
                  ? 'Thank you for your payment. This is an electronic receipt.'
                  : 'ভাড়া প্রদানের জন্য ধন্যবাদ। এটি একটি ইলেকট্রনিক রসিদ।'}
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
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadImage}
                disabled={isDownloading || isSharing}
                className="gap-1.5 shadow-xs font-medium text-slate-700 hover:text-slate-900 border-stone-300 flex-1 sm:flex-none"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <Download className="w-4 h-4 text-slate-600" />
                )}
                {isEn ? 'Download' : 'ডাউনলোড'}
              </Button>
              <Button
                size="sm"
                onClick={handleSendReceipt}
                disabled={isDownloading || isSharing}
                className="gap-2 shadow-xs font-semibold bg-[#25D366] hover:bg-[#20ba59] text-white border-0 transition-colors flex-1 sm:flex-none cursor-pointer"
              >
                {isSharing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <WhatsAppIcon className="w-4 h-4" />
                )}
                {t.sendReceipt || (isEn ? 'Send Receipt' : 'রসিদ পাঠান')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Desktop WhatsApp Fallback Dialog */}
      <DesktopShareFallbackDialog
        open={fallbackOpen}
        onOpenChange={setFallbackOpen}
        data={fallbackData}
        isEn={isEn}
      />
    </>
  );
}

interface DesktopShareFallbackProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    filename: string;
    waUrl: string;
    messageText: string;
    phone: string;
  } | null;
  isEn: boolean;
}

function DesktopShareFallbackDialog({
  open,
  onOpenChange,
  data,
  isEn,
}: DesktopShareFallbackProps) {
  const [copied, setCopied] = React.useState(false);

  if (!data) return null;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(data.messageText);
      setCopied(true);
      toast.success(isEn ? 'Message copied to clipboard!' : 'মেসেজ ক্লিপবোর্ডে কপি হয়েছে!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(data.waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 bg-white rounded-2xl shadow-2xl border border-slate-200">
        <DialogHeader className="space-y-1.5 pb-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shrink-0">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 leading-tight">
                {isEn ? 'Send via WhatsApp' : 'হোয়াটসঅ্যাপে রসিদ পাঠান'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isEn
                  ? 'Follow these 3 simple steps to complete sending'
                  : 'রসিদটি পাঠাতে নিচের ৩টি সহজ ধাপ অনুসরণ করুন'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 3 Step Guidance */}
        <div className="space-y-2 py-1 text-xs">
          {/* Step 1 */}
          <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-emerald-950">
            <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              ✓
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="font-semibold block text-slate-900">
                {isEn ? '1. Receipt Image Downloaded' : '১. রসিদ ইমেজ ডাউনলোড সম্পন্ন'}
              </span>
              <p className="text-[11px] text-slate-600 truncate">
                {isEn ? 'File: ' : 'ফাইল: '}
                <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-900 font-mono text-[10px]">
                  {data.filename}
                </code>
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800">
            <div className="h-5 w-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-0.5">
              <span className="font-semibold block text-slate-900">
                {isEn ? '2. WhatsApp Opened' : '২. হোয়াটসঅ্যাপ ওপেন হয়েছে'}
              </span>
              <p className="text-[11px] text-slate-600">
                {isEn
                  ? 'The tenant chat is open with the prefilled receipt summary.'
                  : 'ভাড়াটিয়ার চ্যাটে রসিদের তথ্যসহ মেসেজ প্রস্তুত করা হয়েছে।'}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800">
            <div className="h-5 w-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-0.5">
              <span className="font-semibold block text-slate-900">
                {isEn ? '3. Attach Image & Send' : '৩. ছবিটি চ্যাটে দিয়ে সেন্ড চাপুন'}
              </span>
              <p className="text-[11px] text-slate-600">
                {isEn
                  ? 'Drag & drop or attach the downloaded receipt image into the chat, then press Send.'
                  : 'ডাউনলোড হওয়া রসিদের ছবিটি চ্যাটে অ্যাটাচ (Attach) করে Send বাটনে চাপ দিন।'}
              </p>
            </div>
          </div>
        </div>

        {/* Message Preview Box with Copy */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
            <span>{isEn ? 'Prefilled Message:' : 'মেসেজের বিবরণ:'}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 px-2 text-[11px] gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">{isEn ? 'Copied' : 'কপি হয়েছে'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Copy' : 'কপি করুন'}</span>
                </>
              )}
            </Button>
          </div>
          <pre className="text-[11px] font-sans bg-slate-100 p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap text-slate-800 leading-relaxed max-h-28 overflow-y-auto">
            {data.messageText}
          </pre>
        </div>

        {/* Honest explanation note */}
        <p className="text-[10px] text-slate-500 bg-amber-50/70 p-2 border border-amber-200/60 rounded-md">
          {isEn
            ? 'Note: Due to web browser security restrictions, websites cannot automatically attach files into WhatsApp Web. Please attach the downloaded receipt image manually.'
            : 'উল্লেখ্য: ব্রাউজার সিকিউরিটির কারণে ওয়েবসাইট থেকে হোয়াটসঅ্যাপে স্বয়ংক্রিয়ভাবে ফাইল যুক্ত করা সম্ভব নয়। অনুগ্রহ করে ডাউনলোড করা রসিদ ইমেজটি চ্যাটে যুক্ত করুন।'}
        </p>

        <DialogFooter className="pt-2 flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {isEn ? 'Done' : 'ঠিক আছে'}
          </Button>
          <Button
            size="sm"
            onClick={handleOpenWhatsApp}
            className="gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4" />
            {isEn ? 'Re-open WhatsApp' : 'পুনরায় হোয়াটসঅ্যাপ খুলুন'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
