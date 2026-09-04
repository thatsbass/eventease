import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { DatabaseModule } from "./database/database.module"
import { AuthModule } from "./auth/auth.module"
import { CheckoutModule } from "./checkout/checkout.module"
import { EventsModule } from "./events/events.module"
import { ProfileModule } from "./profile/profile.module"
import { UploadsModule } from "./uploads/uploads.module"
import { UserModule } from "./user/user.module"
import { MailModule } from "./mail/mail.module"
import { QueueModule } from "./queue/queue.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DatabaseModule,
    MailModule,
    QueueModule,
    AuthModule,
    EventsModule,
    UploadsModule,
    ProfileModule,
    CheckoutModule,
    UserModule,
  ],
})
export class AppModule {}
