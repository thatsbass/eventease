import { ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsOptional, IsString, Matches } from "class-validator"

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "Awa Diop" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: "awa.diop" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9._-]+$/i)
  username?: string

  @ApiPropertyOptional({ example: "Afrique de l'Ouest / UTC+0", nullable: true })
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value
    if (typeof value !== "string") return value
    const trimmed = value.trim()
    return trimmed.length ? trimmed : null
  })
  @IsOptional()
  @IsString()
  bio?: string | null

  @ApiPropertyOptional({ example: "UTC" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  timezone?: string
}

