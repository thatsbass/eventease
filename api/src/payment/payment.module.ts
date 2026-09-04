import { Module } from "@nestjs/common"
import { TicketsModule } from "src/tickets/tickets.module"
import { PaymentController } from "./payment.controller"
import { PaymentService } from "./payment.service"

@Module({
  imports: [TicketsModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}

