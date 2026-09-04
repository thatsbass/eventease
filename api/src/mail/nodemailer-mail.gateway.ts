import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import nodemailer from "nodemailer"
import type Mail from "nodemailer/lib/mailer"
import { MailGateway, SendMailInput } from "./mail.gateway"

@Injectable()
export class NodemailerMailGateway implements MailGateway {
  private transporter?: Mail

  constructor(private readonly config: ConfigService) {}

  async send(input: SendMailInput): Promise<void> {
    const transporter = this.getTransporterOrThrow()

    const from = this.config.get<string>("MAIL_FROM")
    if (!from) throw new InternalServerErrorException("MAIL_FROM is not configured")

    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    })
  }

  private getTransporterOrThrow(): Mail {
    if (this.transporter) return this.transporter

    const host = this.config.get<string>("SMTP_HOST")
    const portRaw = this.config.get<string | number>("SMTP_PORT")
    const secureRaw = this.config.get<string | boolean>("SMTP_SECURE")
    const user = this.config.get<string>("SMTP_USER")
    const pass = this.config.get<string>("SMTP_PASS")

    if (!host) throw new InternalServerErrorException("SMTP_HOST is not configured")
    if (portRaw === undefined || portRaw === null)
      throw new InternalServerErrorException("SMTP_PORT is not configured")

    const port = typeof portRaw === "string" ? Number(portRaw) : portRaw
    if (!Number.isFinite(port)) throw new InternalServerErrorException("SMTP_PORT is invalid")

    const secure =
      typeof secureRaw === "boolean"
        ? secureRaw
        : String(secureRaw ?? "").toLowerCase() === "true"

    if (!user) throw new InternalServerErrorException("SMTP_USER is not configured")
    if (!pass) throw new InternalServerErrorException("SMTP_PASS is not configured")

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    })

    return this.transporter
  }
}

