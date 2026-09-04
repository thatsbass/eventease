import { z } from "zod"

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Veuillez saisir un email valide.")

export const checkEmailRequestSchema = z.object({
  email: emailSchema,
})

export const checkEmailResponseSchema = z.object({
  exists: z.boolean(),
})

export const tokensSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
})

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Veuillez saisir votre mot de passe."),
})

export const registerRequestSchema = z.object({
  email: emailSchema,
  fullName: z.string().trim().min(1, "Veuillez saisir votre nom complet."),
  username: z
    .string()
    .trim()
    .min(1, "Veuillez saisir un nom d'utilisateur.")
    .regex(/^[a-z0-9._-]+$/i, "Nom d'utilisateur invalide."),
  password: z.string().min(6, "Mot de passe: minimum 6 caracteres."),
})

export const organizerProfileSchema = z.object({
  id: z.string(),
  bio: z.string().nullable(),
  timezone: z.string(),
  avatarUrl: z.string().nullable(),
  coverImage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.enum(["USER", "ORGANIZER"]),
  verified: z.boolean(),
  certified: z.boolean(),
  organizerProfile: organizerProfileSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const userSnapshotSchema = userSchema.pick({
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
  role: true,
  verified: true,
  certified: true,
})

export type AuthTokens = z.infer<typeof tokensSchema>
export type AuthUser = z.infer<typeof userSchema>
export type AuthUserSnapshot = z.infer<typeof userSnapshotSchema>

export const toUserSnapshot = (user: AuthUser): AuthUserSnapshot => ({
  id: user.id,
  username: user.username,
  name: user.name,
  avatarUrl: user.avatarUrl,
  role: user.role,
  verified: user.verified,
  certified: user.certified,
})