import { Injectable } from "@nestjs/common"
import { UserService } from "src/user/user.service"
import { UpdateProfileDto } from "./dto/update-profile.dto"

@Injectable()
export class ProfileService {
  constructor(private readonly users: UserService) {}

  updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.users.updateProfile(userId, dto)
  }

  updateAvatar(userId: string, avatarUrl: string) {
    return this.users.updateAvatar(userId, avatarUrl)
  }

  updateCover(userId: string, coverImage: string) {
    return this.users.updateOrganizerCover(userId, coverImage)
  }
}
