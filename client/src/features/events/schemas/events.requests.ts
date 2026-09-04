import { z } from "zod"
import { eventCategorySchema, eventStatusSchema, ticketTierSchema } from "./events.schemas"

export const createEventRequestSchema = z.object({
  title: z.string().trim().min(1, "Nom de l'evenement requis."),
  description: z.string().trim().optional(),
  category: eventCategorySchema.optional(),
  status: eventStatusSchema.optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  timezone: z.string().trim().optional(),
  location: z.string().trim().min(1, "Lieu requis."),
  coverImage: z.string().trim().url().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  requireApproval: z.boolean().optional(),
})

export type CreateEventRequest = z.infer<typeof createEventRequestSchema>

export const updateEventRequestSchema = z.object({
  title: z.string().trim().min(1, "Nom de l'evenement requis.").optional(),
  description: z.string().trim().optional(),
  category: eventCategorySchema.optional(),
  status: eventStatusSchema.optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  timezone: z.string().trim().optional(),
  location: z.string().trim().min(1, "Lieu requis.").optional(),
  coverImage: z.string().trim().url().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  requireApproval: z.boolean().optional(),
})

export type UpdateEventRequest = z.infer<typeof updateEventRequestSchema>

export const createTicketTypeRequestSchema = z.object({
  name: z.string().trim().min(1, "Nom du billet requis."),
  description: z.string().trim().optional(),
  price: z.number().int().min(0),
  currency: z.string().trim().min(1),
  quantity: z.number().int().min(0),
  tier: ticketTierSchema,
})

export type CreateTicketTypeRequest = z.infer<typeof createTicketTypeRequestSchema>

export const updateTicketTypeRequestSchema = z.object({
  name: z.string().trim().min(1, "Nom du billet requis.").optional(),
  description: z.string().trim().optional(),
  price: z.number().int().min(0).optional(),
  currency: z.string().trim().min(1).optional(),
  quantity: z.number().int().min(0).optional(),
  tier: ticketTierSchema.optional(),
})

export type UpdateTicketTypeRequest = z.infer<typeof updateTicketTypeRequestSchema>
