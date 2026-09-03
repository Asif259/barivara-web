import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import { User, AuthTokens } from '../lib/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setAuth: (user, tokens) =>
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        }),
      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
          isAuthenticated: !!accessToken,
        })),
      setUser: (user) => set({ user }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'barivara-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/**
 * Hook that returns true only after Zustand has rehydrated auth state from localStorage.
 * Use this to avoid false logouts on page reload.
 */
export function useAuthHydrated() {
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [hydrated, setHydrated] = useState(_hasHydrated);

  useEffect(() => {
    // If already hydrated (e.g. navigating between pages), resolve immediately
    if (_hasHydrated) {
      setHydrated(true);
      return;
    }
    // Subscribe to the store for when hydration completes
    const unsub = useAuthStore.subscribe((s) => {
      if (s._hasHydrated) {
        setHydrated(true);
        unsub();
      }
    });
    return unsub;
  }, [_hasHydrated]);

  return hydrated;
}
