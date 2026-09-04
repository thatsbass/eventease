import { Module } from "@nestjs/common"
import { TicketsPdfService } from "./pdf/tickets-pdf.service"
import { SendTicketUseCase } from "./send-ticket.usecase"
import { SendTicketProcessor } from "./send-ticket.processor"

@Module({
  providers: [TicketsPdfService, SendTicketUseCase, SendTicketProcessor],
  exports: [SendTicketUseCase, SendTicketProcessor],
})
export class TicketsModule {}

