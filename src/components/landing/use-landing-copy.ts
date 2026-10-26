'use client';

import { useLanguage } from '@/stores/language-store';
import { getLandingCopy, type LandingLang } from './copy';

export function useLandingCopy() {
  const language = useLanguage();
  const lang = (language === 'en' ? 'en' : 'bn') as LandingLang;
  return { lang, t: getLandingCopy(lang) };
}

export type { LandingLang };
