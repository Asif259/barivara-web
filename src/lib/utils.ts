import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | string | null | undefined, lang: 'en' | 'bn' = 'bn'): string {
  if (num === null || num === undefined) return lang === 'bn' ? '০' : '0';
  const str = num.toString();
  if (lang === 'en') return str;
  const bnDigits: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '.': '.', ',': ','
  };
  return str.split('').map(char => bnDigits[char] || char).join('');
}

export function formatCurrency(amount: number | string | null | undefined, lang: 'en' | 'bn' = 'bn'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  if (isNaN(num)) return lang === 'bn' ? '৳০' : '৳0';
  
  if (lang === 'bn') {
    const formatted = num.toLocaleString('en-IN');
    const bnDigits: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      ',': ',', '.': '.'
    };
    const bnNumber = formatted.split('').map(char => bnDigits[char] || char).join('');
    return `৳${bnNumber}`;
  }
  
  return `৳${num.toLocaleString('en-US')}`;
}

export function formatBnDate(dateString: string | Date | null | undefined, lang: 'en' | 'bn' = 'bn'): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  const day = date.getDate().toString().padStart(2, '0');
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const year = date.getFullYear();

  if (lang === 'bn') {
    const bnDigits: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    const bnDay = day.split('').map(d => bnDigits[d] || d).join('');
    const bnYear = year.toString().split('').map(d => bnDigits[d] || d).join('');
    return `${bnDay} ${monthsBn[date.getMonth()]}, ${bnYear}`;
  }

  return `${day} ${monthsEn[date.getMonth()]}, ${year}`;
}

/**
 * Returns the default monthly rent period { year, month } (1-indexed month)
 * which is the calendar month immediately preceding the given date.
 * If current month is September 2026, returns August 2026 { year: 2026, month: 8 }.
 * If current month is January 2027, rolls back to December 2026 { year: 2026, month: 12 }.
 */
export function getDefaultRentPeriod(referenceDate: Date = new Date()): { year: number; month: number } {
  const calYear = referenceDate.getFullYear();
  const calMonth = referenceDate.getMonth() + 1; // 1-12

  if (calMonth === 1) {
    return { year: calYear - 1, month: 12 };
  }
  return { year: calYear, month: calMonth - 1 };
}

