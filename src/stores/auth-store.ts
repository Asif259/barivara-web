import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthTokens } from '../lib/types';

export interface AuthState {
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
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
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
  return useAuthStore((state) => state._hasHydrated);
}

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useSetAuth = () => useAuthStore((state) => state.setAuth);
export const useSetUser = () => useAuthStore((state) => state.setUser);
export const useLogout = () => useAuthStore((state) => state.logout);
