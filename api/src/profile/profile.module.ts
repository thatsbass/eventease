import { Module } from "@nestjs/common"
import { UploadsModule } from "../uploads/uploads.module"
import { ProfileController } from "./profile.controller"
import { ProfileService } from "./profile.service"
import { UserModule } from "src/user/user.module"

@Module({
  imports: [UploadsModule, UserModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
