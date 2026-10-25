import { formatCurrency } from './utils';

export interface PhoneValidationResult {
  isValid: boolean;
  normalizedPhone: string;
}

/**
 * Validates and normalizes phone numbers specifically for WhatsApp wa.me links.
 *
 * Rules:
 * 1. Bangladesh local numbers (11 digits): 01[3-9]XXXXXXXX -> 8801[3-9]XXXXXXXX
 * 2. Bangladesh international numbers (13 digits): 8801[3-9]XXXXXXXX -> 8801[3-9]XXXXXXXX (no double prefix)
 * 3. Strips leading +, spaces, hyphens, parentheses
 * 4. Converts Bengali digits (০-৯) to Arabic numerals (0-9)
 * 5. General valid E.164 international numbers (10 to 15 digits starting with non-zero country code)
 * 6. Empty, too short, or malformed numbers are treated as invalid.
 */
export function validateAndNormalizePhone(phone?: string | null): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, normalizedPhone: '' };
  }

  // Convert Bengali numerals to Western digits
  const bnDigits: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  const converted = phone.replace(/[০-৯]/g, (d) => bnDigits[d] || d);

  // Strip leading 00 if present (common international prefix notation, e.g. 008801...)
  let cleaned = converted.replace(/[\s\-\(\)\+]/g, '').trim();
  cleaned = cleaned.replace(/^00/, '');

  // If non-digits remain after stripping formatting, it is invalid
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, normalizedPhone: '' };
  }

  // 1. Bangladesh local 11-digit mobile: 01[3-9]XXXXXXXX -> 8801[3-9]XXXXXXXX
  if (/^01[3-9]\d{8}$/.test(cleaned)) {
    return { isValid: true, normalizedPhone: `88${cleaned}` };
  }

  // 2. Bangladesh international 13-digit mobile: 8801[3-9]XXXXXXXX
  if (/^8801[3-9]\d{8}$/.test(cleaned)) {
    return { isValid: true, normalizedPhone: cleaned };
  }

  // 3. Other valid international numbers: 10 to 15 digits, starting with non-zero country code
  // E.g. +14155552671, +447911123456
  if (/^[1-9]\d{9,14}$/.test(cleaned)) {
    return { isValid: true, normalizedPhone: cleaned };
  }

  return { isValid: false, normalizedPhone: '' };
}

/**
 * Normalizes phone numbers to standard international format for WhatsApp wa.me links.
 * Returns empty string if the phone number is invalid.
 */
export function formatWhatsAppPhone(phone: string | null | undefined): string {
  const result = validateAndNormalizePhone(phone);
  return result.isValid ? result.normalizedPhone : '';
}

/**
 * Translates payment method code into a localized human-readable label.
 */
export function translatePaymentMethod(method?: string | null, isEn = false): string {
  if (!method) return '-';
  const clean = method.trim().toUpperCase();
  if (isEn) {
    const mapEn: Record<string, string> = {
      CASH: 'Cash',
      BKASH: 'bKash',
      NAGAD: 'Nagad',
      ROCKET: 'Rocket',
      BANK: 'Bank Transfer',
      BANK_TRANSFER: 'Bank Transfer',
      CARD: 'Credit / Debit Card',
      OTHER: 'Other',
    };
    return mapEn[clean] || method;
  }
  const mapBn: Record<string, string> = {
    CASH: 'ক্যাশ (নগদ)',
    BKASH: 'বিকাশ (bKash)',
    NAGAD: 'নগদ (Nagad)',
    ROCKET: 'রকেট (Rocket)',
    BANK: 'ব্যাংক ট্রান্সফার',
    BANK_TRANSFER: 'ব্যাংক ট্রান্সফার',
    CARD: 'কার্ড (Card)',
    OTHER: 'অন্যান্য',
  };
  return mapBn[clean] || method;
}

export interface ReceiptWhatsAppTextParams {
  tenantName?: string | null;
  unitNumber?: string | null;
  propertyName?: string | null;
  month?: number | null;
  year?: number | null;
  amount: number | string;
  /** Short receipt ID, e.g. "6ED6FEF3" — prepended with # in the message. */
  receiptId?: string | null;
  paymentDate?: Date | string | null;
  paymentMethod?: string | null;
  transactionId?: string | null;
  totalAmount?: number | string | null;
  remainingAmount?: number | string | null;
  isEn: boolean;
}

/**
 * Generates localized WhatsApp message text for a payment receipt matching specifications.
 * Includes tenant name, property/unit, receipt #, rent period, amount paid, payment date,
 * payment method, and remaining balance when applicable.
 */
export function buildReceiptWhatsAppText({
  tenantName,
  unitNumber,
  propertyName,
  month,
  year,
  amount,
  receiptId,
  paymentDate,
  paymentMethod,
  transactionId,
  remainingAmount,
  isEn,
}: ReceiptWhatsAppTextParams): string {
  const bnMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ];
  const enMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const toBnDigits = (val: number | string) => {
    const bnMap: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    };
    return val.toString().replace(/\d/g, (d) => bnMap[d] || d);
  };

  const monthIdx = typeof month === 'number' && month >= 1 && month <= 12 ? month - 1 : -1;
  const monthBn = monthIdx >= 0 ? bnMonths[monthIdx] : '';
  const monthEn = monthIdx >= 0 ? enMonths[monthIdx] : '';

  const yearBn = year ? toBnDigits(year) : '';
  const yearEn = year ? year.toString() : '';

  const periodBn = monthBn && yearBn ? `${monthBn} ${yearBn}` : (yearBn || monthBn || '-');
  const periodEn = monthEn && yearEn ? `${monthEn} ${yearEn}` : (yearEn || monthEn || '-');

  const formattedAmountBn = formatCurrency(amount, 'bn');
  const formattedAmountEn = formatCurrency(amount, 'en');

  const refTag = receiptId ? (receiptId.startsWith('#') ? receiptId : `#${receiptId}`) : '-';

  let paymentDateFormattedEn = '';
  let paymentDateFormattedBn = '';
  if (paymentDate) {
    const d = new Date(paymentDate);
    if (!isNaN(d.getTime())) {
      const day = d.getDate().toString().padStart(2, '0');
      const yr = d.getFullYear();
      const mIdx = d.getMonth();
      paymentDateFormattedEn = `${day} ${enMonths[mIdx]} ${yr}`;
      paymentDateFormattedBn = `${toBnDigits(day)} ${bnMonths[mIdx]} ${toBnDigits(yr)}`;
    }
  }

  const locationEn = [unitNumber ? `Unit: ${unitNumber}` : '', propertyName ? `(${propertyName})` : ''].filter(Boolean).join(' ');
  const locationBn = [unitNumber ? `ফ্ল্যাট: ${unitNumber}` : '', propertyName ? `(${propertyName})` : ''].filter(Boolean).join(' ');

  const hasRemaining = remainingAmount !== undefined && remainingAmount !== null && Number(remainingAmount) > 0;

  if (isEn) {
    return [
      'BariVara Rent Payment Receipt',
      tenantName ? `Tenant: ${tenantName}` : '',
      locationEn,
      `Receipt No: ${refTag}`,
      `Rent Month: ${periodEn}`,
      `Amount Paid: ${formattedAmountEn}`,
      paymentDateFormattedEn ? `Payment Date: ${paymentDateFormattedEn}` : '',
      paymentMethod ? `Payment Method: ${translatePaymentMethod(paymentMethod, true)}` : '',
      transactionId ? `Transaction ID: ${transactionId}` : '',
      hasRemaining ? `Remaining Due: ${formatCurrency(remainingAmount, 'en')}` : '',
      '',
      'Thank you for your payment.',
    ].filter(Boolean).join('\n');
  }

  return [
    'বাড়িভাড়া — মানি রিসিট (পেমেন্ট নিশ্চিতকরণ)',
    tenantName ? `ভাড়াটিয়া: ${tenantName}` : '',
    locationBn,
    `রশিদ নং: ${refTag}`,
    `ভাড়ার মাস: ${periodBn}`,
    `পরিশোধিত পরিমাণ: ${formattedAmountBn}`,
    paymentDateFormattedBn ? `পরিশোধের তারিখ: ${paymentDateFormattedBn}` : '',
    paymentMethod ? `পেমেন্ট মাধ্যম: ${translatePaymentMethod(paymentMethod, false)}` : '',
    transactionId ? `ট্রানজেকশন আইডি: ${transactionId}` : '',
    hasRemaining ? `অবশিষ্ট বকেয়া: ${formatCurrency(remainingAmount, 'bn')}` : '',
    '',
    'সময়মত ভাড়া পরিশোধের জন্য ধন্যবাদ।',
  ].filter(Boolean).join('\n');
}

export interface NoticeWhatsAppTextParams {
  tenantName?: string | null;
  unitNumber?: string | null;
  propertyName?: string | null;
  month?: number | null;
  year?: number | null;
  totalAmount: number | string;
  paidAmount?: number | string;
  remainingAmount: number | string;
  dueDate?: Date | string | null;
  isEn: boolean;
}

/**
 * Generates localized WhatsApp message text for a Rent Notice / Payment Request.
 */
export function buildNoticeWhatsAppText({
  tenantName,
  unitNumber,
  propertyName,
  month,
  year,
  totalAmount,
  paidAmount = 0,
  remainingAmount,
  dueDate,
  isEn,
}: NoticeWhatsAppTextParams): string {
  const bnMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ];
  const enMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const toBnDigits = (val: number | string) => {
    const bnMap: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    };
    return val.toString().replace(/\d/g, (d) => bnMap[d] || d);
  };

  const monthIdx = typeof month === 'number' && month >= 1 && month <= 12 ? month - 1 : -1;
  const monthBn = monthIdx >= 0 ? bnMonths[monthIdx] : '';
  const monthEn = monthIdx >= 0 ? enMonths[monthIdx] : '';

  const yearBn = year ? toBnDigits(year) : '';
  const yearEn = year ? year.toString() : '';

  const periodBn = monthBn && yearBn ? `${monthBn} ${yearBn}` : (yearBn || monthBn || '-');
  const periodEn = monthEn && yearEn ? `${monthEn} ${yearEn}` : (yearEn || monthEn || '-');

  const formattedTotalBn = formatCurrency(totalAmount, 'bn');
  const formattedTotalEn = formatCurrency(totalAmount, 'en');
  const formattedPaidBn = formatCurrency(paidAmount, 'bn');
  const formattedPaidEn = formatCurrency(paidAmount, 'en');
  const formattedRemainingBn = formatCurrency(remainingAmount, 'bn');
  const formattedRemainingEn = formatCurrency(remainingAmount, 'en');

  let dueStringBn = '-';
  let dueStringEn = '-';
  if (dueDate) {
    const d = new Date(dueDate);
    if (!isNaN(d.getTime())) {
      const day = d.getDate().toString().padStart(2, '0');
      const yr = d.getFullYear();
      const mIdx = d.getMonth();
      dueStringEn = `${day} ${enMonths[mIdx]} ${yr}`;
      dueStringBn = `${toBnDigits(day)} ${bnMonths[mIdx]} ${toBnDigits(yr)}`;
    }
  }

  const locationEn = [unitNumber ? `Unit: ${unitNumber}` : '', propertyName ? `(${propertyName})` : ''].filter(Boolean).join(' ');
  const locationBn = [unitNumber ? `ফ্ল্যাট: ${unitNumber}` : '', propertyName ? `(${propertyName})` : ''].filter(Boolean).join(' ');

  if (isEn) {
    return [
      'BariVara Rent Payment Notice / Request',
      tenantName ? `Tenant: ${tenantName}` : '',
      locationEn,
      `Rent Month: ${periodEn}`,
      `Total Rent: ${formattedTotalEn}`,
      Number(paidAmount) > 0 ? `Paid: ${formattedPaidEn}` : '',
      `Outstanding Due: ${formattedRemainingEn}`,
      `Payment Due Date: ${dueStringEn}`,
      '',
      'Please arrange the payment before the due date. Thank you.',
    ].filter(Boolean).join('\n');
  }

  return [
    'ভাড়া পরিশোধের অনুরোধ / বাড়িভাড়া নোটিশ',
    tenantName ? `ভাড়াটিয়া: ${tenantName}` : '',
    locationBn,
    `ভাড়ার মাস: ${periodBn}`,
    `মোট ভাড়া: ${formattedTotalBn}`,
    Number(paidAmount) > 0 ? `পরিশোধিত: ${formattedPaidBn}` : '',
    `বর্তমান বকেয়া: ${formattedRemainingBn}`,
    `পরিশোধের শেষ তারিখ: ${dueStringBn}`,
    '',
    'অনুগ্রহ করে শেষ তারিখের মধ্যে ভাড়া পরিশোধ করুন। ধন্যবাদ।',
  ].filter(Boolean).join('\n');
}

/**
 * Generates a wa.me URL with prefilled text and optional international phone number.
 * Phone number is normalized to international format (without +, spaces, dashes, or leading 00).
 */
export function getWhatsAppShareUrl(phone: string | null | undefined, text: string): string {
  const normalizedPhone = formatWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(text);
  if (normalizedPhone) {
    return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Safely opens a WhatsApp URL in a new window/tab, detaching the window opener
 * to protect against reverse tabnabbing and ensuring pop-up blocking can be
 * accurately detected without false positives.
 */
export function openWhatsAppUrl(url: string): { opened: boolean; popupBlocked: boolean } {
  if (typeof window === 'undefined') {
    return { opened: false, popupBlocked: false };
  }

  let win: Window | null = null;
  try {
    // Note: Do not pass 'noopener,noreferrer' as windowFeatures. In modern Chromium/WebKit,
    // passing 'noopener' causes window.open to unconditionally return null,
    // making it impossible to detect if the popup was actually blocked or succeeded.
    win = window.open(url, '_blank');
    if (win) {
      win.opener = null;
    }
  } catch (error) {
    console.warn('[WhatsApp] window.open failed:', error);
  }

  const popupBlocked = !win || win.closed;
  return { opened: !popupBlocked, popupBlocked };
}

/**
 * Checks if the current browser supports file-sharing through the Web Share API
 * without needing an actual file object. Safe to call at render/mount time.
 */
export function canShareFilesCapability(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (typeof navigator.share !== 'function') return false;
  if (typeof navigator.canShare !== 'function') return false;
  try {
    const testFile = new File(['x'], 'test.png', { type: 'image/png' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * Checks if the Web Share API can share the given file.
 */
export function canShareFiles(file: File): boolean {
  if (typeof navigator === 'undefined') return false;
  if (typeof navigator.share !== 'function') return false;
  if (typeof navigator.canShare !== 'function') return false;

  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}
