import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'bn' | 'en';

export interface LanguageState {
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
      partialize: (state) => ({
        language: state.language,
        hasSelectedLanguage: state.hasSelectedLanguage,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function useLanguageHydrated() {
  return useLanguageStore((state) => state._hasHydrated);
}

export const useLanguage = () => useLanguageStore((state) => state.language);
export const useSetLanguage = () => useLanguageStore((state) => state.setLanguage);
export const useHasSelectedLanguage = () => useLanguageStore((state) => state.hasSelectedLanguage);
