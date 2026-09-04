import { useAuthStore } from "../store/auth.store"

export const useAuthHydrated = () => {
  return useAuthStore((s) => s.hasHydrated)
}
