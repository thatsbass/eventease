import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { EventStatus, OrderStatus, PaymentStatus } from "@prisma/client"
import { MESSAGES } from "src/constants"
import { PrismaService } from "src/database/prisma.service"
import { PaymentService } from "src/payment/payment.service"
import { CheckoutRequestDto } from "./dto/checkout.dto"

type CheckoutLine = {
  ticketTypeId: string
  quantity: number
  unitPrice: number
  lineTotal: number
  ticketTypeName: string
}

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async checkout(dto: CheckoutRequestDto) {
    const publicId = dto.publicId
    const buyerName = dto.buyerName
    const buyerEmail = dto.buyerEmail

    const uniqueItems = new Map<string, number>()
    for (const item of dto.items) {
      const id = item.ticketTypeId
      const qty = item.quantity

      if (!id || !Number.isFinite(qty) || qty <= 0) {
        throw new BadRequestException(MESSAGES.checkout.invalidItems)
      }

      uniqueItems.set(id, (uniqueItems.get(id) ?? 0) + qty)
    }

    const event = await this.prisma.event.findFirst({
      where: { publicId, status: EventStatus.PUBLISHED },
      include: { ticketTypes: true },
    })

    if (!event) throw new NotFoundException(MESSAGES.events.eventNotFound)

    const ticketTypeIds = Array.from(uniqueItems.keys())
    const ticketTypes = await this.prisma.ticketType.findMany({
      where: { id: { in: ticketTypeIds }, eventId: event.id },
    })

    if (ticketTypes.length !== ticketTypeIds.length) {
      throw new BadRequestException(MESSAGES.checkout.invalidTicketTypes)
    }

    const currencies = new Set(ticketTypes.map((t) => t.currency))
    if (currencies.size !== 1) {
      throw new BadRequestException(MESSAGES.checkout.mixedCurrenciesNotSupported)
    }
    const currency = ticketTypes[0]?.currency ?? "XOF"

    const lines: CheckoutLine[] = ticketTypes.map((t) => {
      const quantity = uniqueItems.get(t.id) ?? 0
      const remaining = t.quantity - t.sold

      if (quantity > remaining) {
        throw new BadRequestException(MESSAGES.checkout.notEnoughStockFor(t.name))
      }

      const unitPrice = t.price
      const lineTotal = unitPrice * quantity

      return {
        ticketTypeId: t.id,
        quantity,
        unitPrice,
        lineTotal,
        ticketTypeName: t.name,
      }
    })

    const totalAmount = lines.reduce((sum, line) => sum + line.lineTotal, 0)

    const prepared = await this.prisma.$transaction(
      async (tx) => {
        const freshTypes = await tx.ticketType.findMany({
          where: { id: { in: ticketTypeIds }, eventId: event.id },
        })
        const freshById = new Map(freshTypes.map((t) => [t.id, t]))

        for (const line of lines) {
          const fresh = freshById.get(line.ticketTypeId)
          if (!fresh) throw new BadRequestException(MESSAGES.checkout.invalidTicketTypesGeneric)

          const remaining = fresh.quantity - fresh.sold
          if (line.quantity > remaining) {
            throw new BadRequestException(MESSAGES.checkout.notEnoughStockFor(fresh.name))
          }

          if (fresh.currency !== currency) {
            throw new BadRequestException(MESSAGES.checkout.mixedCurrenciesNotSupported)
          }
        }

        const order = await tx.order.create({
          data: {
            eventId: event.id,
            buyerId: null,
            buyerName,
            buyerEmail,
            status: OrderStatus.PENDING,
            totalAmount,
            currency,
            metadata: {
              buyerPhone: dto.buyerPhone,
              paymentMethod: dto.paymentMethod ?? "STRIPE",
            },
            items: {
              createMany: {
                data: lines.map((line) => ({
                  ticketTypeId: line.ticketTypeId,
                  quantity: line.quantity,
                  unitPrice: line.unitPrice,
                  lineTotal: line.lineTotal,
                })),
              },
            },
          },
          select: { id: true },
        })

        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            amount: totalAmount,
            currency,
            status: PaymentStatus.PENDING,
            metadata: {
              buyerName,
              buyerEmail,
            },
          },
          select: { id: true },
        })

        return { orderId: order.id, paymentId: payment.id }
      },
      { isolationLevel: "Serializable" },
    )

    const checkoutSession = await this.paymentService.createCheckoutSession({
      orderId: prepared.orderId,
      paymentId: prepared.paymentId,
      buyerEmail,
      currency,
      lines: lines.map((line) => ({
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        ticketTypeName: line.ticketTypeName,
      })),
      event: {
        id: event.id,
        publicId: event.publicId,
        title: event.title,
      },
    })

    return {
      orderId: prepared.orderId,
      eventId: event.id,
      publicId: event.publicId,
      totalAmount,
      currency,
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      checkoutSessionId: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
    }
  }
}
