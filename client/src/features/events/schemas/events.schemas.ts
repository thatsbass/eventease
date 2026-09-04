import { z } from "zod"

export const ticketTierSchema = z.enum(["standard", "vip", "early"])

export const ticketTypeDtoSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number().int().nonnegative(),
  currency: z.string(),
  quantity: z.number().int().nonnegative(),
  sold: z.number().int().nonnegative(),
  tier: ticketTierSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const organizerUserDtoSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  certified : z.boolean()
})

export const organizerProfileDtoSchema = z.object({
  id: z.string(),
  bio: z.string().nullable(),
  timezone: z.string(),
  avatarUrl: z.string().nullable(),
  coverImage: z.string().nullable(),
  user: organizerUserDtoSchema,
})

export const eventStatusSchema = z.enum(["DRAFT", "PUBLISHED", "CANCELLED"])
export const eventCategorySchema = z.enum([
  "MUSIC",
  "TECH",
  "SPORTS",
  "BUSINESS",
  "EDUCATION",
  "ART",
  "COMMUNITY",
  "OTHER",
])

export const eventDtoSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: eventCategorySchema,
  status: eventStatusSchema,
  startAt: z.string(),
  endAt: z.string().nullable(),
  timezone: z.string(),
  location: z.string(),
  coverImage: z.string().nullable(),
  capacity: z.number().int().nonnegative().nullable(),
  requireApproval: z.boolean(),
  organizerId: z.string(),
  organizer: organizerProfileDtoSchema,
  ticketTypes: z.array(ticketTypeDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const eventDtoListSchema = z.array(eventDtoSchema)

export type TicketTierDto = z.infer<typeof ticketTierSchema>
export type TicketTypeDto = z.infer<typeof ticketTypeDtoSchema>
export type OrganizerUserDto = z.infer<typeof organizerUserDtoSchema>
export type OrganizerProfileDto = z.infer<typeof organizerProfileDtoSchema>
export type EventStatusDto = z.infer<typeof eventStatusSchema>
export type EventCategoryDto = z.infer<typeof eventCategorySchema>
export type EventDto = z.infer<typeof eventDtoSchema>
