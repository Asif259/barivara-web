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
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

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
  const receiptRef = React.useRef<HTMLDivElement>(null);
  const { data: paymentDetails } = useQuery({
    queryKey: ['payment-receipt-details', payment?.id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${payment!.id}`);
      return response.data.data;
    },
    enabled: open && !!payment?.id,
  });
  const currentSignatureId = paymentDetails?.owner?.signatureFileId ?? null;

  const { data: signatureUrl } = useQuery({
    queryKey: ['payment-signature-url', payment?.id, currentSignatureId],
    queryFn: () => getFileDownloadUrl(currentSignatureId!),
    enabled: open && !!currentSignatureId,
    retry: false,
  });

  if (!payment) return null;

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    try {
      setIsDownloading(true);
      // Generate clean high-res PNG image from DOM
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 2, // Crisp 2x retina export
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true, // Prevents SecurityError from cross-origin Google Fonts CSS
      });

      const unitNum = payment.monthlyRent?.agreement?.unit?.unitNumber || 'Rent';
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'];
      const monthNum = payment.monthlyRent?.month;
      const monthStr = typeof monthNum === 'number' && monthNum >= 1 && monthNum <= 12 
        ? monthNames[monthNum - 1] 
        : (monthNum || 'Month');
      const year = payment.monthlyRent?.year || 'Year';
      const link = document.createElement('a');
      link.download = `${unitNum}_${monthStr}_${year}.png`;
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

  const monthlyRent = payment.monthlyRent;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 bg-white max-h-[92vh] flex flex-col overflow-hidden rounded-xl shadow-2xl border border-stone-300">
        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto flex-1 bg-stone-100/70 p-4 sm:p-7">
          <div ref={receiptRef} id="printable-receipt" className="space-y-5 bg-white p-5 sm:p-7 border border-stone-300 shadow-sm">
            {/* Header */}
            <div className="border-y-[3px] border-emerald-800 py-4">
              <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div 
                  className="h-11 w-11 bg-emerald-800 text-white flex items-center justify-center shrink-0 text-xl"
                  style={{ backgroundColor: '#065f46', color: '#ffffff' }}
                >
                  <Building2 className="w-5 h-5 text-white stroke-[2.2]" />
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
                  {isEn ? 'Receipt No.' : 'রসিদ নং'} #{payment.id.substring(0, 8).toUpperCase()}
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
                  <span className="font-medium text-slate-900">{formatBnDate(payment.paymentDate, language)}</span>
                </div>

                <div className="px-4 py-2 flex justify-between text-slate-700">
                  <span>{t.paymentMethod}:</span>
                  <span className="font-medium text-slate-900">{translatePaymentMethod(payment.paymentMethod)}</span>
                </div>

                {payment.transactionId && (
                  <div className="px-4 py-2 flex justify-between text-slate-700">
                    <span>{t.transactionId}:</span>
                    <span className="font-mono text-slate-900 font-medium">{toBnNum(payment.transactionId)}</span>
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
                  {formatCurrency(payment.amount, language)}
                </span>
              </div>
              <div 
                className="h-8 w-8 rounded-full bg-emerald-800 text-white flex items-center justify-center"
                style={{ backgroundColor: '#065f46', color: '#ffffff' }}
              >
                <CheckCircle2 className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
            </div>

            {payment.note && (
              <div className="text-xs bg-stone-50 px-3 py-2.5 border-l-2 border-stone-300 text-slate-700">
                <span className="font-semibold text-slate-900">{t.note}:</span> {payment.note}
              </div>
            )}

            {/* Signatures */}
            <div className="pt-5 grid grid-cols-1 text-xs text-slate-600">
              <div className="text-center space-y-1.5">
                {signatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={signatureUrl}
                    alt={t.ownerSignature || (isEn ? 'Owner Signature' : 'মালিকের স্বাক্ষর')}
                    crossOrigin="anonymous"
                    className="h-14 mx-auto object-contain"
                    style={{ maxWidth: '11rem' }}
                  />
                ) : null}
                <div className="border-t border-stone-500 w-44 mx-auto"></div>
                <span className="font-semibold text-[10px] uppercase tracking-[0.12em] text-stone-700 block">
                  {t.ownerSignature || (isEn ? 'Owner Signature' : 'মালিকের স্বাক্ষর')}
                </span>
                {payment.owner?.name && (
                  <span className="font-medium text-[11px] text-slate-800 block">
                    {payment.owner.name}
                  </span>
                )}
              </div>
            </div>

            {/* Footer Note */}
            <div className="border-t border-stone-200 pt-3 text-center text-[10px] text-slate-500">
              {isEn
                ? 'Thank you for your payment. Generated electronically via BariVara System.'
                : 'ভাড়া প্রদানের জন্য ধন্যবাদ। এটি বাড়িভাড়া সিস্টেমের একটি ইলেকট্রনিক রসিদ।'}
            </div>
          </div>
        </div>

        {/* Sticky Action Buttons Footer */}
        <DialogFooter className="p-3.5 px-6 bg-stone-50 border-t border-stone-300 flex items-center justify-between gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="gap-2 shadow-xs font-semibold"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Download className="w-4 h-4 text-white" />
            )}
            {t.downloadReceipt || (isEn ? 'Download Image' : 'রসিদ ডাউনলোড করুন')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
