import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"

export class UpdateAvatarDto {
  @ApiProperty({ description: "Image URL (Cloudinary secure_url or Dicebear URL)" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  avatarUrl!: string
}
