'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';
import { formatCurrency, formatBnDate } from '@/lib/utils';

export const CANONICAL_DOCUMENT_WIDTH = 600;

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

/**
 * Waits until web fonts and every <img> inside `node` (logo, owner signature) are
 * loaded and decoded, so the capture never contains a half-loaded image.
 */
export async function waitForRenderReady(node: HTMLElement): Promise<void> {
  try {
    if ('fonts' in document) {
      await document.fonts.ready;
      // Guarantee explicit weights 400, 500, 600, 700 of both Inter and Noto Sans Bengali are ready:
      await Promise.race([
        Promise.all([
          document.fonts.load('400 12px "Inter"'),
          document.fonts.load('500 12px "Inter"'),
          document.fonts.load('600 12px "Inter"'),
          document.fonts.load('700 12px "Inter"'),
          document.fonts.load('400 12px "Noto Sans Bengali"'),
          document.fonts.load('500 12px "Noto Sans Bengali"'),
          document.fonts.load('600 12px "Noto Sans Bengali"'),
          document.fonts.load('700 12px "Noto Sans Bengali"'),
        ]),
        new Promise<void>((resolve) => window.setTimeout(resolve, 3000)),
      ]);
    }
  } catch (error) {
    console.warn('Font loading check failed:', error);
  }

  const images = Array.from(node.querySelectorAll('img'));
  const imagesReady = Promise.all(
    images.map((img) => {
      if (img.complete) {
        return img.decode ? img.decode().catch(() => undefined) : Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
      });
    }),
  );

  await Promise.race([
    imagesReady,
    new Promise<void>((resolve) => window.setTimeout(resolve, 4000)),
  ]);
}

/**
 * Prints the exported receipt/notice image through a hidden iframe.
 */
export function printImage(dataUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';

    const remove = () => iframe.parentNode?.removeChild(iframe);

    iframe.onload = () => {
      const win = iframe.contentWindow;
      if (!win) {
        remove();
        reject(new Error('Print frame is unavailable'));
        return;
      }
      win.onafterprint = remove;
      window.setTimeout(remove, 60000);
      win.focus();
      win.print();
      resolve();
    };

    iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title></title><style>
      @page { size: auto; margin: 12mm; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body { display: flex; justify-content: center; align-items: flex-start; }
      img { max-width: 100%; height: auto; display: block; }
    </style></head><body><img src="${dataUrl}" alt="" /></body></html>`;

    document.body.appendChild(iframe);
  });
}

export interface BaseRentDocumentProps {
  property?: {
    id?: string;
    name?: string;
    address?: string;
  } | null;
  unit?: {
    id?: string;
    unitNumber: string;
  } | null;
  tenantName?: string | null;
  tenantPhone?: string | null;
  owner?: {
    name?: string | null;
    phone?: string | null;
  } | null;
  signatureUrl?: string | null;
  language?: 'bn' | 'en';
  className?: string;
}

export interface NoticeDocumentProps extends BaseRentDocumentProps {
  mode: 'notice';
  noticeId: string | number;
  createdAt?: Date | string | null;
  month: number;
  year: number;
  dueDate?: Date | string | null;
  baseRent: number;
  serviceFee?: number;
  parkingFee?: number;
  extraCharge?: number;
  lateFee?: number;
  discount?: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface PaymentReceiptDocumentProps extends BaseRentDocumentProps {
  mode: 'payment-receipt';
  receiptId: string;
  paymentDate: Date | string;
  paymentMethod: string;
  transactionId?: string | null;
  amountPaid: number;
  month?: number | null;
  year?: number | null;
  baseRent?: number;
  serviceFee?: number;
  parkingFee?: number;
  extraCharge?: number;
  lateFee?: number;
  discount?: number;
  totalAmount?: number;
  remainingAmount?: number;
  note?: string | null;
}

export type RentDocumentProps = NoticeDocumentProps | PaymentReceiptDocumentProps;

export const RentDocument = forwardRef<HTMLDivElement, RentDocumentProps>(function RentDocument(
  props,
  ref,
) {
  const {
    property,
    unit,
    tenantName,
    tenantPhone,
    owner,
    signatureUrl,
    language = 'bn',
    className = '',
  } = props;

  const isEn = language === 'en';

  const toBnNum = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined) return '';
    if (isEn) return String(val);
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(val).replace(/[0-9]/g, (digit) => bnDigits[parseInt(digit, 10)]);
  };

  const bnMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ];
  const enMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getMonthLabel = (m?: number | null, y?: number | null) => {
    if (!m) return '-';
    const monthName = isEn ? enMonths[m - 1] || String(m) : bnMonths[m - 1] || String(m);
    const yearStr = y ? (isEn ? String(y) : toBnNum(y)) : '';
    return `${monthName} ${yearStr}`.trim();
  };

  const translatePaymentMethod = (method?: string | null) => {
    if (!method) return '-';
    if (!isEn) {
      const map: Record<string, string> = {
        CASH: 'ক্যাশ (নগদ)',
        BKASH: 'বিকাশ',
        NAGAD: 'নগদ (Nagad)',
        BANK_TRANSFER: 'ব্যাংক ট্রান্সফার',
        OTHER: 'অন্যান্য',
      };
      return map[method] || method;
    }
    const map: Record<string, string> = {
      CASH: 'Cash',
      BKASH: 'bKash',
      NAGAD: 'Nagad',
      BANK_TRANSFER: 'Bank Transfer',
      OTHER: 'Other',
    };
    return map[method] || method;
  };

  if (props.mode === 'payment-receipt') {
    const {
      receiptId,
      paymentDate,
      paymentMethod,
      transactionId,
      amountPaid,
      month,
      year,
      baseRent,
      serviceFee = 0,
      parkingFee = 0,
      extraCharge = 0,
      lateFee = 0,
      discount = 0,
      totalAmount,
      remainingAmount,
      note,
    } = props;

    const hasBreakdown = baseRent !== undefined || totalAmount !== undefined;

    return (
      <div
        ref={ref}
        id="printable-receipt"
        className={`space-y-5 bg-white border border-stone-300 shadow-sm font-document ${className}`}
        style={{
          width: CANONICAL_DOCUMENT_WIDTH,
          padding: '28px',
          fontFamily: 'var(--font-inter, "Inter"), var(--font-bengali, "Noto Sans Bengali"), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textRendering: 'optimizeLegibility',
        }}
      >
        {/* Header */}
        <div className="border-y-[3px] border-emerald-800 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded">
                <Image
                  src="/logo.png"
                  alt="BariVara"
                  width={44}
                  height={44}
                  unoptimized
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-[22px] font-bold text-slate-950 tracking-tight leading-tight">
                  {property?.name || (isEn ? 'BariVara' : 'বাড়িভাড়া (BariVara)')}
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
                {isEn ? 'PAID' : 'পরিশোধিত'}
              </span>
              <p className="text-[10px] text-slate-500 mt-2 font-mono">
                {isEn ? 'Receipt No.' : 'রশিদ নং'} #{receiptId.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Tenant and unit details */}
        <div className="grid grid-cols-2 divide-x divide-stone-300 border-y border-stone-300 text-xs">
          <div className="space-y-1 py-3 pr-4">
            <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-[0.12em] block">
              {isEn ? 'Tenant Information:' : 'ভাড়াটিয়ার তথ্য:'}
            </span>
            <span className="font-semibold text-slate-950 text-sm block">
              {tenantName || (isEn ? 'Tenant' : 'ভাড়াটিয়া')}
            </span>
            <div className="flex items-center gap-1 text-slate-600 text-[11px]">
              <span>{tenantPhone ? toBnNum(tenantPhone) : '-'}</span>
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
          <div className="bg-stone-100 px-4 py-2.5 border-b border-stone-300 flex justify-between items-center text-[10px] font-bold text-stone-700 uppercase tracking-[0.16em]">
            <span>{isEn ? 'Description' : 'বিবরণ'}</span>
            <span>{isEn ? 'Amount' : 'পরিমাণ'}</span>
          </div>

          <div className="divide-y divide-stone-200 bg-white">
            {/* Rent Period */}
            <div className="px-4 py-2.5 flex justify-between text-slate-700">
              <span>{isEn ? 'Rent Period' : 'ভাড়ার মাস ও সাল'}:</span>
              <span className="font-semibold text-slate-950 font-mono">
                {month && year ? `${toBnNum(month)}/${toBnNum(year)}` : '-'}
              </span>
            </div>

            {hasBreakdown && (
              <>
                {baseRent !== undefined && (
                  <div className="px-4 py-2 flex justify-between text-slate-700">
                    <span>{isEn ? 'Base Rent' : 'মূল ভাড়া'}:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(baseRent, language)}</span>
                  </div>
                )}

                {serviceFee > 0 && (
                  <div className="px-4 py-2 flex justify-between text-slate-700">
                    <span>{isEn ? 'Service Fee' : 'সার্ভিস চার্জ'}:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(serviceFee, language)}</span>
                  </div>
                )}

                {parkingFee > 0 && (
                  <div className="px-4 py-2 flex justify-between text-slate-700">
                    <span>{isEn ? 'Parking Fee' : 'পার্কিং চার্জ'}:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(parkingFee, language)}</span>
                  </div>
                )}

                {extraCharge > 0 && (
                  <div className="px-4 py-2 flex justify-between text-slate-700">
                    <span>{isEn ? 'Extra Charge' : 'অন্যান্য চার্জ'}:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(extraCharge, language)}</span>
                  </div>
                )}

                {lateFee !== undefined && lateFee > 0 && (
                  <div className="px-4 py-2 flex justify-between text-rose-700">
                    <span>{isEn ? 'Late Fee' : 'বিলম্ব ফি'}:</span>
                    <span className="font-medium">+ {formatCurrency(lateFee, language)}</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="px-4 py-2 flex justify-between text-emerald-800 font-medium">
                    <span>{isEn ? 'Discount' : 'ছাড়'}:</span>
                    <span>- {formatCurrency(discount, language)}</span>
                  </div>
                )}

                {totalAmount !== undefined && (
                  <div className="px-4 py-2.5 flex justify-between font-semibold text-slate-950 bg-stone-100">
                    <span>{isEn ? 'Total Monthly Bill' : 'মোট মাসিক বিল'}:</span>
                    <span>{formatCurrency(totalAmount, language)}</span>
                  </div>
                )}
              </>
            )}

            {/* Payment Details */}
            <div className="px-4 py-2 flex justify-between text-slate-700">
              <span>{isEn ? 'Payment Receiving Date' : 'টাকা গ্রহণের তারিখ'}:</span>
              <span className="font-medium text-slate-900">{formatBnDate(paymentDate, language)}</span>
            </div>

            <div className="px-4 py-2 flex justify-between text-slate-700">
              <span>{isEn ? 'Payment Method' : 'পেমেন্ট মেথড'}:</span>
              <span className="font-medium text-slate-900">{translatePaymentMethod(paymentMethod)}</span>
            </div>

            {transactionId && (
              <div className="px-4 py-2 flex justify-between text-slate-700">
                <span>{isEn ? 'Transaction ID' : 'ট্রানজেকশন আইডি'}:</span>
                <span className="font-mono text-slate-900 font-medium">{toBnNum(transactionId)}</span>
              </div>
            )}

            {remainingAmount !== undefined && (
              <div className="px-4 py-2 flex justify-between text-slate-700">
                <span>{isEn ? 'Remaining Due' : 'অবশিষ্ট বকেয়া'}:</span>
                <span className={`font-bold ${remainingAmount > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {formatCurrency(remainingAmount, language)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Settlement */}
        <div
          className="flex items-center justify-between bg-emerald-50 px-4 py-3"
          style={{ backgroundColor: '#ecfdf5' }}
        >
          <div>
            <span className="text-[10px] text-emerald-900 block font-bold uppercase tracking-[0.16em]">
              {isEn ? 'Amount Paid (Received)' : 'পরিশোধিত টাকার পরিমাণ (প্রাপ্ত)'}
            </span>
            <span className="text-2xl font-bold text-emerald-950">
              {formatCurrency(amountPaid, language)}
            </span>
          </div>

          {/* Right: owner signature */}
          <div className="text-right text-xs text-slate-600 space-y-1 shrink-0">
            {signatureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signatureUrl}
                alt={isEn ? 'Owner Signature' : 'মালিকের স্বাক্ষর'}
                crossOrigin="anonymous"
                className="h-7 ml-auto object-contain"
                style={{ maxWidth: '9rem' }}
              />
            ) : null}
            <div className="border-t border-stone-400 w-24 ml-auto" />
            {owner?.name && (
              <span className="font-medium text-[11px] text-slate-800 block">
                {owner.name}
              </span>
            )}
          </div>
        </div>

        {note && (
          <div className="text-xs bg-stone-50 px-3 py-2.5 border-l-2 border-stone-300 text-slate-700">
            <span className="font-semibold text-slate-900">{isEn ? 'Note' : 'মন্তব্য'}:</span> {note}
          </div>
        )}

        {/* Footer Note */}
        <div className="border-t border-stone-200 pt-3 text-center text-[10px] text-slate-500">
          {isEn
            ? 'Thank you for your payment. This is an electronic receipt.'
            : 'ভাড়া প্রদানের জন্য ধন্যবাদ। এটি একটি ইলেকট্রনিক রশিদ।'}
        </div>
      </div>
    );
  }

  // mode === 'notice'
  const {
    noticeId,
    createdAt,
    month,
    year,
    dueDate,
    baseRent,
    serviceFee = 0,
    parkingFee = 0,
    extraCharge = 0,
    lateFee = 0,
    discount = 0,
    totalAmount,
    paidAmount = 0,
    remainingAmount,
  } = props;

  const isFullyPaid = remainingAmount <= 0;
  const accentColor = isFullyPaid ? '#065f46' : '#b45309';
  const settlementBg = isFullyPaid ? '#ecfdf5' : '#fffbeb';
  const settlementText = isFullyPaid ? '#064e3b' : '#78350f';

  return (
    <div
      ref={ref}
      id="canonical-rent-notice"
      className={`space-y-5 bg-white border border-stone-300 shadow-sm select-none font-document ${className}`}
      style={{
        width: CANONICAL_DOCUMENT_WIDTH,
        padding: '28px',
        fontFamily: 'var(--font-inter, "Inter"), var(--font-bengali, "Noto Sans Bengali"), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        textRendering: 'optimizeLegibility',
      }}
    >
      {/* Header */}
      <div className="border-y-[3px] border-emerald-800 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded">
              <Image
                src="/logo.png"
                alt="BariVara"
                width={44}
                height={44}
                unoptimized
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-slate-950 tracking-tight leading-tight">
                {property?.name || (isEn ? 'BariVara' : 'বাড়িভাড়া (BariVara)')}
              </h2>
              {property?.address && (
                <p className="text-[11px] text-slate-600 leading-tight mt-1">{property.address}</p>
              )}
              {owner?.name && (
                <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                  {isEn ? 'Landlord' : 'মালিক'}: {owner.name}
                  {owner.phone ? ` (${toBnNum(owner.phone)})` : ''}
                </p>
              )}
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-[0.18em] mt-1.5">
                {isEn ? 'Rent Payment Notice' : 'ভাড়া পরিশোধের নোটিশ'}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span
              className="inline-block text-[10px] px-2 py-1 font-bold tracking-[0.14em]"
              style={{ backgroundColor: accentColor, color: '#ffffff' }}
            >
              {isFullyPaid
                ? (isEn ? 'FULLY PAID' : 'পরিশোধিত')
                : (isEn ? 'PAYMENT DUE' : 'বকেয়া')}
            </span>
            <p className="text-[10px] text-slate-500 mt-2 font-mono">
              {isEn ? 'Notice No.' : 'নোটিশ নং'} #{String(noticeId).substring(0, 8).toUpperCase()}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {isEn ? 'Issued' : 'ইস্যুর তারিখ'}:{' '}
              {createdAt ? formatBnDate(createdAt, language) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Rent period, due date, tenant and unit details */}
      <div className="border-y border-stone-300 divide-y divide-stone-300 text-xs">
        <div className="grid grid-cols-2 divide-x divide-stone-300">
          <div className="space-y-1 py-3 pr-4">
            <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-[0.12em] block">
              {isEn ? 'Rent Month:' : 'ভাড়ার মাস:'}
            </span>
            <span className="font-semibold text-slate-950 text-sm block">
              {getMonthLabel(month, year)}
            </span>
          </div>
          <div className="text-right space-y-1 py-3 pl-4">
            <span className="font-bold text-[10px] uppercase tracking-[0.12em] block" style={{ color: '#be123c' }}>
              {isEn ? 'Payment Due Date:' : 'পরিশোধের শেষ তারিখ:'}
            </span>
            <span className="font-semibold text-sm block" style={{ color: '#9f1239' }}>
              {dueDate ? formatBnDate(dueDate, language) : '-'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-stone-300">
          <div className="space-y-1 py-3 pr-4">
            <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-[0.12em] block">
              {isEn ? 'Billed To (Tenant):' : 'ভাড়াটিয়া:'}
            </span>
            <span className="font-semibold text-slate-950 text-sm block">
              {tenantName || (isEn ? 'Tenant' : 'ভাড়াটিয়া')}
            </span>
            <span className="text-slate-600 text-[11px] block">
              {tenantPhone ? toBnNum(tenantPhone) : '-'}
            </span>
          </div>
          <div className="text-right space-y-1 py-3 pl-4">
            <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-[0.12em] block">
              {isEn ? 'Unit & Property:' : 'ইউনিট ও বাড়ি:'}
            </span>
            <span className="font-semibold text-slate-950 text-sm block">
              {unit ? `${isEn ? 'Unit' : 'ইউনিট'} ${toBnNum(unit.unitNumber)}` : '-'}
            </span>
            <span className="text-slate-600 text-[11px] block">
              {property?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Charges Table */}
      <div className="border border-stone-300 overflow-hidden text-xs">
        <div className="bg-stone-100 px-4 py-2.5 border-b border-stone-300 flex justify-between items-center text-[10px] font-bold text-stone-700 uppercase tracking-[0.16em]">
          <span>{isEn ? 'Itemized Charges' : 'ভাড়ার হিসাব ও বিবরণী'}</span>
          <span>{isEn ? 'Amount' : 'পরিমাণ'}</span>
        </div>

        <div className="divide-y divide-stone-200 bg-white">
          <div className="px-4 py-2 flex justify-between text-slate-700">
            <span>{isEn ? 'Base Rent' : 'মূল ভাড়া'}:</span>
            <span className="font-medium text-slate-900">{formatCurrency(baseRent, language)}</span>
          </div>

          {serviceFee > 0 && (
            <div className="px-4 py-2 flex justify-between text-slate-700">
              <span>{isEn ? 'Service Fee' : 'সার্ভিস চার্জ'}:</span>
              <span className="font-medium text-slate-900">{formatCurrency(serviceFee, language)}</span>
            </div>
          )}

          {parkingFee > 0 && (
            <div className="px-4 py-2 flex justify-between text-slate-700">
              <span>{isEn ? 'Parking Fee' : 'পার্কিং চার্জ'}:</span>
              <span className="font-medium text-slate-900">{formatCurrency(parkingFee, language)}</span>
            </div>
          )}

          {extraCharge > 0 && (
            <div className="px-4 py-2 flex justify-between text-slate-700">
              <span>{isEn ? 'Extra Charges' : 'অন্যান্য চার্জ'}:</span>
              <span className="font-medium text-slate-900">{formatCurrency(extraCharge, language)}</span>
            </div>
          )}

          {lateFee !== undefined && lateFee > 0 && (
            <div className="px-4 py-2 flex justify-between text-rose-700">
              <span>{isEn ? 'Late Fee' : 'বিলম্ব ফি'}:</span>
              <span className="font-medium">+ {formatCurrency(lateFee, language)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="px-4 py-2 flex justify-between text-emerald-800 font-medium">
              <span>{isEn ? 'Discount' : 'ডিসকাউন্ট'}:</span>
              <span>- {formatCurrency(discount, language)}</span>
            </div>
          )}

          <div className="px-4 py-2.5 flex justify-between font-semibold text-slate-950 bg-stone-100">
            <span>{isEn ? 'Total Bill for Month' : 'এই মাসের মোট বিল'}:</span>
            <span>{formatCurrency(totalAmount, language)}</span>
          </div>

          {paidAmount > 0 && (
            <div className="px-4 py-2 flex justify-between text-emerald-800 font-medium">
              <span>{isEn ? 'Paid So Far' : 'পূর্বে পরিশোধিত ভাড়া'}:</span>
              <span>- {formatCurrency(paidAmount, language)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Settlement */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: settlementBg }}
      >
        <div>
          <span
            className="text-[10px] block font-bold uppercase tracking-[0.16em]"
            style={{ color: settlementText }}
          >
            {isEn ? 'Total Balance Due' : 'সর্বমোট প্রদেয় বকেয়া'}
          </span>
          <span className="text-2xl font-bold block" style={{ color: settlementText }}>
            {formatCurrency(remainingAmount, language)}
          </span>
          <span className="text-[11px] block mt-0.5" style={{ color: accentColor }}>
            {isFullyPaid
              ? (isEn ? 'Fully paid. No payment required.' : 'সম্পূর্ণ পরিশোধিত। কোনো বকেয়া নেই।')
              : (isEn ? 'Please pay before the due date.' : 'অনুগ্রহ করে শেষ তারিখের মধ্যে পরিশোধ করুন।')}
          </span>
        </div>

        <div className="text-right text-xs text-slate-600 space-y-1 shrink-0">
          {signatureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={signatureUrl}
              alt={isEn ? 'Owner Signature' : 'মালিকের স্বাক্ষর'}
              crossOrigin="anonymous"
              className="h-7 ml-auto object-contain"
              style={{ maxWidth: '9rem' }}
            />
          ) : null}
          <div className="border-t border-stone-400 w-24 ml-auto" />
          <span className="font-medium text-[11px] text-slate-800 block">
            {owner?.name || (isEn ? 'Landlord' : 'বাড়িওয়ালা')}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {isEn ? 'Authorized Signatory' : 'অনুরোধকারী / বাড়িওয়ালা'}
          </span>
        </div>
      </div>

      {!isFullyPaid && (
        <div className="text-xs bg-stone-50 px-3 py-2.5 border-l-2 border-stone-300 text-slate-700">
          <span className="font-semibold text-slate-900">
            {isEn ? 'Payment Instructions' : 'পেমেন্ট নির্দেশিকা'}:
          </span>{' '}
          {isEn
            ? 'Please pay via Cash, bKash, Nagad, or Bank Transfer to the landlord directly before the deadline.'
            : 'নির্ধারিত শেষ তারিখের মধ্যে ক্যাশ, বিকাশ, নগদ অথবা ব্যাংক ট্রান্সফারের মাধ্যমে বাড়িওয়ালার নিকট ভাড়া পরিশোধ করুন।'}
        </div>
      )}

      {/* Footer Note */}
      <div className="border-t border-stone-200 pt-3 text-center text-[10px] text-slate-500">
        {isEn
          ? 'This is an electronic payment notice, not a receipt.'
          : 'এটি একটি ইলেকট্রনিক ভাড়ার নোটিশ, রশিদ নয়।'}
      </div>
    </div>
  );
});
