import { Controller, Headers, HttpCode, Post, Req } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { SWAGGER } from "src/constants"
import { PaymentService } from "./payment.service"

@ApiTags(SWAGGER.tags.payment)
@Controller("checkout")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("webhook/stripe")
  @HttpCode(200)
  @ApiOperation({ summary: SWAGGER.payment.stripeWebhook })
  stripeWebhook(@Req() req: any, @Headers("stripe-signature") signature?: string) {
    return this.paymentService.handleStripeWebhook(req.rawBody, signature)
  }
}

