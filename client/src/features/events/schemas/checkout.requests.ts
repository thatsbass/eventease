import { z } from "zod"

export const checkoutItemRequestSchema = z.object({
  ticketTypeId: z.string().trim().min(1),
  quantity: z.number().int().min(1),
})

export const checkoutRequestSchema = z.object({
  publicId: z.string().trim().min(1),
  buyerName: z.string().trim().min(1),
  buyerEmail: z.string().trim().email(),
  buyerPhone: z.string().trim().optional(),
  paymentMethod: z.string().trim().optional(),
  items: z.array(checkoutItemRequestSchema).min(1),
})

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>
