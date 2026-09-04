import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common"
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger"
import { FileInterceptor } from "@nestjs/platform-express"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { UploadsService } from "src/uploads/uploads.service"
import { SWAGGER } from "src/constants"
import { UpdateAvatarDto } from "./dto/update-avatar.dto"
import { UpdateCoverDto } from "./dto/update-cover.dto"
import { UpdateProfileDto } from "./dto/update-profile.dto"
import { ProfileService } from "./profile.service"

@ApiTags(SWAGGER.tags.profile)
@Controller("profile")
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.profile.updateProfile })
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.sub, dto)
  }

  @Patch("avatar")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.profile.updateAvatar })
  updateAvatar(@Req() req: any, @Body() dto: UpdateAvatarDto) {
    return this.profileService.updateAvatar(req.user.sub, dto.avatarUrl)
  }

  @Post("avatar/upload")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
      },
      required: ["file"],
    },
  })
  @ApiOperation({ summary: SWAGGER.profile.uploadAvatar })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.sub as string

    const uploaded = await this.uploadsService.uploadImage(file, {
      folder: `eventease/users/${userId}`,
      public_id: "avatar",
      overwrite: true,
      context: "avatar",
    })

    return this.profileService.updateAvatar(userId, uploaded.optimized_url)
  }

  @Patch("cover")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.profile.updateCover })
  updateCover(@Req() req: any, @Body() dto: UpdateCoverDto) {
    return this.profileService.updateCover(req.user.sub, dto.coverImage)
  }

  @Post("cover/upload")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
      },
      required: ["file"],
    },
  })
  @ApiOperation({ summary: SWAGGER.profile.uploadCover })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadCover(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.sub as string

    const uploaded = await this.uploadsService.uploadImage(file, {
      folder: `eventease/users/${userId}`,
      public_id: "cover",
      overwrite: true,
      context: "organizer_cover",
    })

    return this.profileService.updateCover(userId, uploaded.optimized_url)
  }
}

