import { formatCurrency } from './utils';

/**
 * Normalizes phone numbers to standard E.164 without '+' or leading symbols
 * specifically formatted for WhatsApp wa.me links.
 *
 * Handles:
 * - 01711223344 -> 8801711223344 (Bangladesh local format)
 * - +8801711223344 -> 8801711223344
 * - 8801711223344 -> 8801711223344
 * - 01711-223344 -> 8801711223344
 * - Bengali numerals: ০১৭১১২২৩৩৪৪ -> 8801711223344
 */
export function formatWhatsAppPhone(phone: string | null | undefined): string {
  if (!phone) return '';

  // Convert Bengali numerals to Western Arabic digits
  const bnDigits: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  const normalized = phone.replace(/[০-৯]/g, (d) => bnDigits[d] || d);

  // Strip all non-digit characters
  const digitsOnly = normalized.replace(/\D/g, '');

  // Bangladesh 11-digit mobile starting with 01 (e.g. 017XXXXXXXX)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('01')) {
    return `88${digitsOnly}`;
  }

  // Bangladesh 13-digit mobile already prefixed with 8801
  if (digitsOnly.length === 13 && digitsOnly.startsWith('8801')) {
    return digitsOnly;
  }

  // Already prefixed with 88 and followed by 01 (or international format)
  return digitsOnly;
}

export interface ReceiptWhatsAppTextParams {
  tenantName?: string | null;
  unitNumber?: string | null;
  month?: number | null;
  year?: number | null;
  amount: number | string;
  isEn: boolean;
}

/**
 * Generates localized WhatsApp message text matching the required format.
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
 */
export function buildReceiptWhatsAppText({
  tenantName,
  unitNumber,
  month,
  year,
  amount,
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

  const cleanTenantName = (tenantName || '').trim() || (isEn ? 'Tenant' : 'ভাড়াটিয়া');
  const cleanUnitNumber = (unitNumber || '').trim() || (isEn ? 'N/A' : '-');

  if (isEn) {
    return [
      'Rent Payment Receipt',
      '',
      `Tenant: ${cleanTenantName}`,
      `Unit: ${cleanUnitNumber}`,
      `Month: ${periodEn}`,
      `Paid: ${formattedAmountEn}`,
      '',
      'Thank you.',
    ].join('\n');
  }

  return [
    'বাড়িভাড়া পরিশোধের রসিদ',
    '',
    `ভাড়াটিয়া: ${cleanTenantName}`,
    `ফ্ল্যাট: ${cleanUnitNumber}`,
    `মাস: ${periodBn}`,
    `পরিশোধ: ${formattedAmountBn}`,
    '',
    'ধন্যবাদ।',
  ].join('\n');
}

/**
 * Generates a wa.me URL with prefilled text and optional international phone number.
 */
export function getWhatsAppShareUrl(phone: string | null | undefined, text: string): string {
  const formattedPhone = formatWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(text);
  if (formattedPhone) {
    return `https://wa.me/${formattedPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
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
