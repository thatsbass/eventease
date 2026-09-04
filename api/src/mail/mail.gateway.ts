export type MailAttachment = {
  filename: string
  content: Buffer
  contentType?: string
}

export type SendMailInput = {
  to: string
  subject: string
  html?: string
  text?: string
  attachments?: MailAttachment[]
}

export interface MailGateway {
  send(input: SendMailInput): Promise<void>
}

