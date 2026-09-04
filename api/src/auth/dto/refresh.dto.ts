import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"

export class RefreshDto {
  @ApiProperty({ description: "JWT refresh token" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  refresh_token!: string
}
