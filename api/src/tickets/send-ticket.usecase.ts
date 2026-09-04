import { Injectable } from "@nestjs/common"
import { TicketEmailQueueService } from "src/queue/ticket-email-queue.service"

@Injectable()
export class SendTicketUseCase {
  constructor(private readonly queue: TicketEmailQueueService) {}

  async execute(orderId: string) {
    await this.queue.enqueueSendOrderTickets(orderId)
  }
}

