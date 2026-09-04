import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "src/database/prisma.service"
import { MAIL_GATEWAY } from "src/mail/mail.tokens"
import type { MailGateway } from "src/mail/mail.gateway"
import { TicketsPdfService } from "./pdf/tickets-pdf.service"
import { SendOrderTicketsJobData } from "src/queue/jobs/send-order-tickets.job"
import { OrderStatus } from "@prisma/client"

@Injectable()
export class SendTicketProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: TicketsPdfService,
    @Inject(MAIL_GATEWAY) private readonly mail: MailGateway,
  ) {}

  async process(data: SendOrderTicketsJobData) {
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        event: true,
        tickets: { include: { ticketType: true }, orderBy: { createdAt: "asc" } },
      },
    })

    if (!order) throw new NotFoundException("Order not found")
    if (order.status !== OrderStatus.PAID) throw new NotFoundException("Order not paid")

    const pdfBuffer = await this.pdf.renderOrderTicketsPdf({
      eventTitle: order.event.title,
      eventPublicId: order.event.publicId,
      startAt: order.event.startAt,
      timezone: order.event.timezone,
      location: order.event.location,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      tickets: order.tickets.map((t) => ({
        code: t.code,
        ticketTypeName: t.ticketType.name,
        tier: t.ticketType.tier,
      })),
    })

    const subject = `Vos tickets - ${order.event.title}`
    const html = this.buildEmailHtml(order.buyerName, order.event.title, order.event.publicId)

    await this.mail.send({
      to: order.buyerEmail,
      subject,
      html,
      attachments: [
        {
          filename: `tickets-${order.event.publicId}-${order.id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    })
  }

  private buildEmailHtml(buyerName: string, eventTitle: string, eventPublicId: string) {
    const safeName = this.escapeHtml(buyerName)
    const safeTitle = this.escapeHtml(eventTitle)
    const safePublicId = this.escapeHtml(eventPublicId)
    return `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 12px 0">Bonjour ${safeName},</h2>
        <p style="margin:0 0 12px 0">
          Merci pour votre achat. Vous trouverez vos tickets en pièce jointe (PDF).
        </p>
        <p style="margin:0 0 12px 0">
          Événement : <strong>${safeTitle}</strong><br/>
          Référence : <strong>${safePublicId}</strong>
        </p>
        <p style="margin:18px 0 0 0;color:#555;font-size:12px">
          Si vous n'êtes pas à l'origine de cet achat, vous pouvez ignorer cet email.
        </p>
      </div>
    `.trim()
  }

  private escapeHtml(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;")
  }
}

