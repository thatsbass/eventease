import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  WebhookEventStatus,
} from "@prisma/client"
import crypto from "crypto"
import Stripe from "stripe"
import { MESSAGES } from "src/constants"
import { PrismaService } from "src/database/prisma.service"
import { SendTicketProcessor } from "src/tickets/send-ticket.processor"
import { SendTicketUseCase } from "src/tickets/send-ticket.usecase"

type CheckoutSessionLine = {
  quantity: number
  unitPrice: number
  ticketTypeName: string
}

type CreateCheckoutSessionInput = {
  orderId: string
  paymentId: string
  buyerEmail: string
  currency: string
  lines: CheckoutSessionLine[]
  event: {
    id: string
    publicId: string
    title: string
  }
}

const makeTicketCode = () => {
  const short = crypto.randomUUID().split("-")[0].toUpperCase()
  return `TCKT-${short}`
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name)
  private stripeClient?: Stripe
  private static readonly webhookLockStaleMs = 10 * 60 * 1000

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly sendTicketUseCase: SendTicketUseCase,
    private readonly sendTicketProcessor: SendTicketProcessor,
  ) {}

  async createCheckoutSession(input: CreateCheckoutSessionInput) {
    try {
      const session = await this.getStripe().checkout.sessions.create(
        {
          mode: "payment",
          success_url: this.getRequiredConfig("STRIPE_CHECKOUT_SUCCESS_URL"),
          cancel_url: this.getRequiredConfig("STRIPE_CHECKOUT_CANCEL_URL"),
          customer_email: input.buyerEmail,
          metadata: {
            orderId: input.orderId,
            eventId: input.event.id,
            eventPublicId: input.event.publicId,
          },
          line_items: input.lines.map((line) => ({
            quantity: line.quantity,
            price_data: {
              currency: input.currency.toLowerCase(),
              unit_amount: line.unitPrice,
              product_data: {
                name: line.ticketTypeName,
                description: input.event.title,
              },
            },
          })),
        },
        {
          idempotencyKey: this.makeCheckoutSessionIdempotencyKey(input),
        },
      )

      if (!session.url) {
        throw new BadRequestException(MESSAGES.payment.paymentInitializationFailed)
      }

      await this.prisma.payment.update({
        where: { id: input.paymentId },
        data: {
          stripeSessionId: session.id,
        },
      })

      return {
        id: session.id,
        url: session.url,
      }
    } catch (err: any) {
      this.logger.error(`stripe session init failed for order=${input.orderId}: ${err?.message}`)

      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: input.paymentId },
          data: {
            status: PaymentStatus.FAILED,
            metadata: {
              reason: "stripe-session-init-failed",
              error: err?.message ?? "unknown",
            },
          },
        }),
        this.prisma.order.update({
          where: { id: input.orderId },
          data: { status: OrderStatus.CANCELLED },
        }),
      ])

      throw new BadRequestException(MESSAGES.payment.paymentInitializationFailed)
    }
  }

  async handleStripeWebhook(rawBody: Buffer | undefined, signature?: string) {
    if (!rawBody || !Buffer.isBuffer(rawBody) || !signature) {
      throw new BadRequestException(MESSAGES.payment.invalidStripeSignature)
    }

    const webhookSecret = this.config.get<string>("STRIPE_WEBHOOK_SECRET")
    if (!webhookSecret) {
      throw new InternalServerErrorException(MESSAGES.payment.stripeWebhookSecretNotConfigured)
    }

    let event: Stripe.Event
    try {
      event = this.getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch {
      throw new BadRequestException(MESSAGES.payment.invalidStripeSignature)
    }

    const lock = await this.acquireWebhookProcessingLock(event)
    if (!lock.shouldProcess || !lock.webhookEventId) {
      return { received: true, duplicate: true }
    }

    try {
      switch (event.type) {
        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded":
          await this.onStripeSessionSucceeded(event.data.object as Stripe.Checkout.Session)
          break
        case "checkout.session.expired":
          await this.onStripeSessionFailed(
            event.data.object as Stripe.Checkout.Session,
            PaymentStatus.CANCELLED,
          )
          break
        case "checkout.session.async_payment_failed":
          await this.onStripeSessionFailed(
            event.data.object as Stripe.Checkout.Session,
            PaymentStatus.FAILED,
          )
          break
        default:
          break
      }

      await this.markWebhookProcessed(lock.webhookEventId)
      return { received: true }
    } catch (err: any) {
      await this.markWebhookFailed(lock.webhookEventId, err?.message)
      throw err
    }
  }

  private async onStripeSessionSucceeded(session: Stripe.Checkout.Session) {
    if (!session.id) return
    if (session.payment_status !== "paid") return

    const existing = await this.prisma.payment.findUnique({
      where: { stripeSessionId: session.id },
      select: { id: true },
    })
    if (!existing) return

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id

    const completed = await this.prisma.$transaction(
      async (tx) => {
        const payment = await tx.payment.findUnique({
          where: { id: existing.id },
          include: {
            order: {
              include: {
                items: {
                  include: { ticketType: true },
                },
                tickets: { select: { id: true } },
              },
            },
          },
        })

        if (!payment) return { shouldSendTickets: false, orderId: "" }

        if (payment.status === PaymentStatus.SUCCEEDED && payment.order.status === OrderStatus.PAID) {
          return { shouldSendTickets: false, orderId: payment.orderId }
        }

        const ticketTypeIds = payment.order.items.map((i) => i.ticketTypeId)
        const freshTypes = await tx.ticketType.findMany({
          where: { id: { in: ticketTypeIds }, eventId: payment.order.eventId },
        })
        const freshById = new Map(freshTypes.map((t) => [t.id, t]))

        for (const item of payment.order.items) {
          const fresh = freshById.get(item.ticketTypeId)
          if (!fresh) throw new BadRequestException(MESSAGES.checkout.invalidTicketTypesGeneric)

          const remaining = fresh.quantity - fresh.sold
          if (item.quantity > remaining) {
            throw new BadRequestException(MESSAGES.checkout.notEnoughStockFor(item.ticketType.name))
          }
        }

        if (payment.order.tickets.length === 0) {
          for (const item of payment.order.items) {
            await tx.ticketType.update({
              where: { id: item.ticketTypeId },
              data: { sold: { increment: item.quantity } },
            })
          }

          const ticketsToCreate: {
            code: string
            eventId: string
            ticketTypeId: string
            orderId: string
          }[] = []

          for (const item of payment.order.items) {
            for (let i = 0; i < item.quantity; i += 1) {
              ticketsToCreate.push({
                code: makeTicketCode(),
                eventId: payment.order.eventId,
                ticketTypeId: item.ticketTypeId,
                orderId: payment.orderId,
              })
            }
          }

          try {
            await tx.ticket.createMany({ data: ticketsToCreate })
          } catch {
            const retried = ticketsToCreate.map((t) => ({
              ...t,
              code: makeTicketCode(),
            }))
            await tx.ticket.createMany({ data: retried })
          }
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCEEDED,
            stripePaymentIntentId: paymentIntentId ?? null,
            stripeCustomerId: customerId ?? null,
            paidAt: new Date(),
          },
        })

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.PAID },
        })

        return { shouldSendTickets: payment.order.tickets.length === 0, orderId: payment.orderId }
      },
      { isolationLevel: "Serializable" },
    )

    if (completed.shouldSendTickets && completed.orderId) {
      await this.dispatchTicketEmail(completed.orderId)
    }
  }

  private async onStripeSessionFailed(
    session: Stripe.Checkout.Session,
    paymentStatus: "FAILED" | "CANCELLED",
  ) {
    if (!session.id) return

    const payment = await this.prisma.payment.findUnique({
      where: { stripeSessionId: session.id },
      select: { id: true, status: true, orderId: true },
    })
    if (!payment) return

    if (payment.status === PaymentStatus.SUCCEEDED) return

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: paymentStatus },
      }),
      this.prisma.order.updateMany({
        where: { id: payment.orderId, status: OrderStatus.PENDING },
        data: { status: OrderStatus.CANCELLED },
      }),
    ])
  }

  private async dispatchTicketEmail(orderId: string) {
    try {
      await this.sendTicketUseCase.execute(orderId)
    } catch (err: any) {
      this.logger.warn(`ticket email enqueue failed for order=${orderId}, trying direct send: ${err?.message}`)
      try {
        await this.sendTicketProcessor.process({ orderId })
      } catch (directErr: any) {
        this.logger.error(`direct ticket email send failed for order=${orderId}: ${directErr?.message}`)
      }
    }
  }

  private getStripe() {
    if (this.stripeClient) return this.stripeClient

    const secretKey = this.config.get<string>("STRIPE_SECRET_KEY")
    if (!secretKey) {
      throw new InternalServerErrorException(MESSAGES.payment.stripeNotConfigured)
    }

    this.stripeClient = new Stripe(secretKey)
    return this.stripeClient
  }

  private getRequiredConfig(key: string) {
    const value = this.config.get<string>(key)
    if (!value) {
      throw new InternalServerErrorException(MESSAGES.payment.paymentInitializationFailed)
    }
    return value
  }

  private makeCheckoutSessionIdempotencyKey(input: CreateCheckoutSessionInput) {
    return `checkout-session:${input.orderId}:${input.paymentId}`
  }

  private async acquireWebhookProcessingLock(event: Stripe.Event) {
    try {
      const created = await this.prisma.paymentWebhookEvent.create({
        data: {
          provider: PaymentProvider.STRIPE,
          eventId: event.id,
          eventType: event.type,
          status: WebhookEventStatus.PROCESSING,
          attemptCount: 1,
          metadata: {
            stripeCreatedAt: event.created,
          },
        },
        select: { id: true },
      })

      return { shouldProcess: true, webhookEventId: created.id }
    } catch (err: any) {
      if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") {
        throw err
      }
    }

    const existing = await this.prisma.paymentWebhookEvent.findUnique({
      where: { eventId: event.id },
      select: { id: true, status: true, updatedAt: true },
    })
    if (!existing) return { shouldProcess: false as const }

    if (existing.status === WebhookEventStatus.PROCESSED) {
      return { shouldProcess: false as const }
    }

    if (existing.status === WebhookEventStatus.PROCESSING) {
      const isStale =
        Date.now() - existing.updatedAt.getTime() > PaymentService.webhookLockStaleMs
      if (!isStale) return { shouldProcess: false as const }
    }

    const updated = await this.prisma.paymentWebhookEvent.update({
      where: { id: existing.id },
      data: {
        status: WebhookEventStatus.PROCESSING,
        eventType: event.type,
        attemptCount: { increment: 1 },
        lastError: null,
      },
      select: { id: true },
    })

    return { shouldProcess: true, webhookEventId: updated.id }
  }

  private async markWebhookProcessed(webhookEventId: string) {
    await this.prisma.paymentWebhookEvent.update({
      where: { id: webhookEventId },
      data: {
        status: WebhookEventStatus.PROCESSED,
        processedAt: new Date(),
        lastError: null,
      },
    })
  }

  private async markWebhookFailed(webhookEventId: string, errorMessage?: string) {
    const safeMessage = (errorMessage ?? "unknown").slice(0, 2000)
    await this.prisma.paymentWebhookEvent.update({
      where: { id: webhookEventId },
      data: {
        status: WebhookEventStatus.FAILED,
        lastError: safeMessage,
      },
    })
  }
}
