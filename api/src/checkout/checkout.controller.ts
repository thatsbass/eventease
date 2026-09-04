import { Body, Controller, Post } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { CheckoutRequestDto } from "./dto/checkout.dto"
import { CheckoutService } from "./checkout.service"
import { SWAGGER } from "src/constants"

@ApiTags(SWAGGER.tags.checkout)
@Controller("checkout")
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @ApiOperation({ summary: SWAGGER.checkout.checkout })
  checkout(@Body() dto: CheckoutRequestDto) {
    return this.checkoutService.checkout(dto)
  }
}
