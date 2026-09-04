"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { ApiError } from "@/lib/api/client"
import { authApi } from "../api/auth.api"
import { toUserSnapshot } from "../schemas/auth.schemas"
import { useAuthStore } from "../store/auth.store"

export const AuthBootstrap = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  const enabled = Boolean(accessToken || refreshToken)

  const { data, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled,
    retry: false,
  })

  useEffect(() => {
    if (data) setUser(toUserSnapshot(data))
  }, [data, setUser])

  useEffect(() => {
    if (!error) return

  /**
   * NOTE : Don't destroy the session on transient network/server errors.
   */
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      logout()
    }
  }, [error, logout])

  return null
}
