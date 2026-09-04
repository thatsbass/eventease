import { Global, Module } from "@nestjs/common"
import { TicketEmailQueueService } from "./ticket-email-queue.service"

@Global()
@Module({
  providers: [TicketEmailQueueService],
  exports: [TicketEmailQueueService],
})
export class QueueModule {}

