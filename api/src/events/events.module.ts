import { Module } from "@nestjs/common"
import { UploadsModule } from "../uploads/uploads.module"
import { UserModule } from "src/user/user.module"
import { EventsController } from "./events.controller"
import { EventsService } from "./events.service"

@Module({
  imports: [UploadsModule, UserModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
