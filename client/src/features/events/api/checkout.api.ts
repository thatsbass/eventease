import { apiFetch } from "@/lib/api/client"
import {
  checkoutRequestSchema,
  type CheckoutRequest,
} from "../schemas/checkout.requests"
import {
  checkoutSessionResponseSchema,
  type CheckoutSessionResponse,
} from "../schemas/checkout.schemas"

export const checkoutApi = {
  createSession: async (values: CheckoutRequest): Promise<CheckoutSessionResponse> => {
    const body = checkoutRequestSchema.parse(values)

    return apiFetch(
      "/checkout",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      checkoutSessionResponseSchema,
    )
  },
}
