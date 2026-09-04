import { Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import { Worker } from "bullmq"
import { AppModule } from "./app.module"
import { SEND_ORDER_TICKETS_JOB, TICKET_EMAIL_QUEUE_NAME } from "./queue/queue.constants"
import { SendTicketProcessor } from "./tickets/send-ticket.processor"
import { SendOrderTicketsJobData } from "./queue/jobs/send-order-tickets.job"

async function bootstrapWorker() {
  const logger = new Logger("TicketEmailWorker")
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["log", "warn", "error"],
  })

  const config = app.get(ConfigService)
  const processor = app.get(SendTicketProcessor)

  const redisUrl = config.getOrThrow<string>("REDIS_URL")
  const concurrencyRaw = config.get<string | number>("TICKET_EMAIL_WORKER_CONCURRENCY") ?? 5
  const concurrency = typeof concurrencyRaw === "string" ? Number(concurrencyRaw) : concurrencyRaw

  const worker = new Worker<SendOrderTicketsJobData>(
    TICKET_EMAIL_QUEUE_NAME,
    async (job) => {
      if (job.name !== SEND_ORDER_TICKETS_JOB) return
      await processor.process(job.data)
    },
    {
      connection: parseRedisUrl(redisUrl),
      concurrency: Number.isFinite(concurrency) ? concurrency : 5,
    },
  )

  worker.on("completed", (job) => {
    logger.log(`completed job=${job.name} id=${job.id}`)
  })

  worker.on("failed", (job, err) => {
    logger.error(`failed job=${job?.name} id=${job?.id}: ${err?.message}`, err?.stack)
  })

  const shutdown = async () => {
    logger.warn("shutting down...")
    await worker.close()
    await app.close()
    process.exit(0)
  }

  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)

  logger.log(`started queue=${TICKET_EMAIL_QUEUE_NAME} concurrency=${worker.opts.concurrency ?? 5}`)
}

function parseRedisUrl(redisUrl: string) {
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

bootstrapWorker().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
