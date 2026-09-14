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

  // Strip all whitespace, hyphens, parentheses, plus signs
  const cleaned = converted.replace(/[\s\-\(\)\+]/g, '').trim();

  // If non-digits remain after stripping formatting, it is invalid
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, normalizedPhone: '' };
  }

  // 1. Bangladesh local 11-digit mobile: 01[3-9]XXXXXXXX
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

export interface ReceiptWhatsAppTextParams {
  tenantName?: string | null;
  unitNumber?: string | null;
  month?: number | null;
  year?: number | null;
  amount: number | string;
  /** Short receipt ID, e.g. "6ED6FEF3" — prepended with # in the message. */
  receiptId?: string | null;
  isEn: boolean;
}

/**
 * Generates localized WhatsApp message text matching the required specification.
 *
 * Bangla Example:
 * BariVara Payment Receipt
 *
 * ভাড়াটিয়া: মোঃ রাকিব হাসান
 * ফ্ল্যাট: 4B
 * মাস: সেপ্টেম্বর ২০২৬
 * পরিশোধ: ৳25,500
 *
 * ধন্যবাদ।
 *
 * English Example:
 * BariVara Payment Receipt
 *
 * Tenant: Rahim Ahmed
 * Unit: 4B
 * Month: September 2026
 * Paid: ৳25,500
 *
 * Thank you.
 */
export function buildReceiptWhatsAppText({
  tenantName,
  unitNumber,
  month,
  year,
  amount,
  receiptId,
  isEn,
}: ReceiptWhatsAppTextParams): string {
  const bnMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
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

  const refTag = receiptId ? `#${receiptId}` : '-';

  if (isEn) {
    return [
      'Your rent payment receipt.',
      tenantName ? `Tenant: ${tenantName}` : '',
      unitNumber ? `Unit: ${unitNumber}` : '',
      `Receipt No: ${refTag}`,
      `Amount Paid: ${formattedAmountEn}`,
      `Rent Period: ${periodEn}`,
      '',
      'Thank you.',
    ].filter(Boolean).join('\n');
  }

  return [
    'আপনার ভাড়ার পেমেন্টের রশিদ।',
    tenantName ? `ভাড়াটিয়া: ${tenantName}` : '',
    unitNumber ? `ফ্ল্যাট: ${unitNumber}` : '',
    `রশিদ নং: ${refTag}`,
    `পরিশোধিত পরিমাণ: ${formattedAmountBn}`,
    `ভাড়া মাস: ${periodBn}`,
    '',
    'ধন্যবাদ।',
  ].filter(Boolean).join('\n');
}

/**
 * Generates a wa.me URL with prefilled text and optional international phone number.
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
