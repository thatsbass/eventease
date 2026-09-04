import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { AuthTokens, AuthUserSnapshot } from "../schemas/auth.schemas"

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUserSnapshot | null

  hasHydrated: boolean
  setHasHydrated: (value: boolean) => void

  setTokens: (tokens: AuthTokens) => void
  setUser: (user: AuthUserSnapshot | null) => void
  logout: () => void
}

type AuthPersistedState = Pick<AuthState, "accessToken" | "refreshToken" | "user">

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      setTokens: (tokens) =>
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        }),

      setUser: (user) => set({ user }),

      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: "eventease.auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state): AuthPersistedState => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        // Avoid redirect loops while the store is still hydrating.
        state?.setHasHydrated(true)
      },
    },
  ),
)
