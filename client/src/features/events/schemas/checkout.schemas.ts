import { z } from "zod"

export const checkoutSessionResponseSchema = z.object({
  orderId: z.string(),
  eventId: z.string(),
  publicId: z.string(),
  totalAmount: z.number().int().nonnegative(),
  currency: z.string(),
  orderStatus: z.enum(["PENDING", "PAID", "CANCELLED", "REFUNDED"]),
  paymentStatus: z.enum(["PENDING", "SUCCEEDED", "FAILED", "CANCELLED", "REFUNDED"]),
  checkoutSessionId: z.string(),
  checkoutUrl: z.string().url(),
})

export type CheckoutSessionResponse = z.infer<typeof checkoutSessionResponseSchema>
