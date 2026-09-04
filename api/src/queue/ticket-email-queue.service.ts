import { Injectable, InternalServerErrorException, OnModuleDestroy } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Queue } from "bullmq"
import { TICKET_EMAIL_QUEUE_NAME, SEND_ORDER_TICKETS_JOB } from "./queue.constants"

@Injectable()
export class TicketEmailQueueService implements OnModuleDestroy {
  private queue?: Queue

  constructor(private readonly config: ConfigService) {
    const redisUrl = this.config.get<string>("REDIS_URL")
    if (!redisUrl) return

    this.queue = new Queue(TICKET_EMAIL_QUEUE_NAME, {
      connection: this.parseRedisUrl(redisUrl),
    })
  }

  async enqueueSendOrderTickets(orderId: string) {
    if (!this.queue) {
      throw new InternalServerErrorException("REDIS_URL is not configured (ticket emails queue disabled)")
    }

    await this.queue.add(
      SEND_ORDER_TICKETS_JOB,
      { orderId },
      {
        jobId: `order:${orderId}`,
        removeOnComplete: 1000,
        removeOnFail: 1000,
        attempts: 5,
        backoff: { type: "exponential", delay: 1000 },
      },
    )
  }

  async onModuleDestroy() {
    await this.queue?.close()
  }

  private parseRedisUrl(redisUrl: string) {
    const url = new URL(redisUrl)
    const isTls = url.protocol === "rediss:"

    const port = url.port ? Number(url.port) : 6379
    const host = url.hostname || "localhost"

    return {
      host,
      port,
      username: url.username || undefined,
      password: url.password || undefined,
      db: url.pathname?.length > 1 ? Number(url.pathname.slice(1)) : undefined,
      tls: isTls ? {} : undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    }
  }
}
