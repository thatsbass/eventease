import { z } from "zod"
import { apiFetch } from "@/lib/api/client"
import {
  checkEmailRequestSchema,
  checkEmailResponseSchema,
  loginRequestSchema,
  registerRequestSchema,
  tokensSchema,
  userSchema,
} from "../schemas/auth.schemas"

export const authApi = {
  checkEmail: async (email: string) => {
    const body = checkEmailRequestSchema.parse({ email })

    return apiFetch(
      "/auth/check-email",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      checkEmailResponseSchema,
    )
  },

  login: async (values: { email: string; password: string }) => {
    const body = loginRequestSchema.parse(values)

    return apiFetch(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      tokensSchema,
    )
  },

  register: async (values: { email: string; fullName: string; username: string; password: string }) => {
    const body = registerRequestSchema.parse(values)

    return apiFetch(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      tokensSchema,
    )
  },

  me: async () => {
    return apiFetch("/auth/me", { method: "GET", auth: true }, userSchema)
  },

  logout: async () => {
    return apiFetch(
      "/auth/logout",
      { method: "POST", auth: true },
      z.object({ ok: z.boolean() }),
    )
  },
}