import { Global, Module } from "@nestjs/common"
import { MAIL_GATEWAY } from "./mail.tokens"
import { NodemailerMailGateway } from "./nodemailer-mail.gateway"

@Global()
@Module({
  providers: [
    {
      provide: MAIL_GATEWAY,
      useClass: NodemailerMailGateway,
    },
  ],
  exports: [MAIL_GATEWAY],
})
export class MailModule {}

