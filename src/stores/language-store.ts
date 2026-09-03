import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'bn' | 'en';

interface LanguageState {
  language: Language;
  hasSelectedLanguage: boolean;
  setLanguage: (lang: Language) => void;
  resetSelection: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'bn',
      hasSelectedLanguage: false,
      setLanguage: (lang) => set({ language: lang, hasSelectedLanguage: true }),
      resetSelection: () => set({ hasSelectedLanguage: false }),
    }),
    {
      name: 'barivara-language',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
