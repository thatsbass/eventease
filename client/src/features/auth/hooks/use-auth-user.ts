import { useMemo } from "react"
import { useAuthStore } from "../store/auth.store"
import constants from "@/constant"

const { DICEBEAR_BASE_URL } = constants;

const makeDicebearUrl = (seed: string) => {
  const safeSeed = encodeURIComponent(seed || "User")
  return `${DICEBEAR_BASE_URL}${safeSeed}`
}

export type AuthUserView = {
  user: ReturnType<typeof useAuthStore.getState>["user"]
  isAuthenticated: boolean
  displayName: string
  avatarSrc: string
}

export const useAuthUser = (): AuthUserView => {
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const refreshToken = useAuthStore((s) => s.refreshToken)

  return useMemo(() => {
    const isAuthenticated = Boolean(accessToken || refreshToken)

    const displayName = user?.name?.trim() || user?.username?.trim() || "User"
    const avatarSrc = user?.avatarUrl?.trim() || makeDicebearUrl(displayName)

    return { user, isAuthenticated, displayName, avatarSrc }
  }, [accessToken, refreshToken, user])
}