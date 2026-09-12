import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'bn' | 'en';

interface LanguageState {
  language: Language;
  hasSelectedLanguage: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setLanguage: (lang: Language) => void;
  resetSelection: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'bn',
      hasSelectedLanguage: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setLanguage: (lang) => set({ language: lang, hasSelectedLanguage: true }),
      resetSelection: () => set({ hasSelectedLanguage: false }),
    }),
    {
      name: 'barivara-language',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function useLanguageHydrated() {
  return useLanguageStore((state) => state._hasHydrated);
}
