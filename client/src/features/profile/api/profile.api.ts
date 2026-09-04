import { apiFetch } from "@/lib/api/client"
import { organizerProfileSchema, userSchema } from "@/features/auth/schemas/auth.schemas"
import { z } from "zod"

const updateProfileRequestSchema = z.object({
  name: z.string().trim().min(1).optional(),
  username: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9._-]+$/i)
    .optional(),
  bio: z.string().trim().nullable().optional(),
  timezone: z.string().trim().min(1).optional(),
})

export const profileApi = {
  updateProfile: async (values: {
    name?: string
    username?: string
    bio?: string | null
    timezone?: string
  }) => {
    const body = updateProfileRequestSchema.parse(values)
    return apiFetch("/profile", { method: "PATCH", auth: true, body: JSON.stringify(body) }, userSchema)
  },

  uploadCover: async (file: File) => {
    const form = new FormData()
    form.append("file", file)

    return apiFetch("/profile/cover/upload", { method: "POST", auth: true, body: form }, organizerProfileSchema)
  },

  uploadAvatar: async (file: File) => {
    const form = new FormData()
    form.append("file", file)

    // Even if we don't use it in UI yet, we keep it here for consistency (MVP).
    return apiFetch("/profile/avatar/upload", { method: "POST", auth: true, body: form }, userSchema)
  },
}
