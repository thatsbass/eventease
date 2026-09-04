import { ApiProperty } from "@nestjs/swagger"
import { EventCategory, EventStatus } from "@prisma/client"
import { Transform } from "class-transformer"
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from "class-validator"

export class CreateEventDto {
  @ApiProperty({ example: "ByteBass - Introduction a l'IA" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  title!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  description?: string

  @ApiProperty({ enum: EventCategory, required: false, default: EventCategory.OTHER })
  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory

  @ApiProperty({ enum: EventStatus, required: false, default: EventStatus.DRAFT })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus

  @ApiProperty({ example: "2026-02-10T13:30:00.000Z" })
  @IsDateString()
  startAt!: string

  @ApiProperty({ required: false, example: "2026-02-10T16:30:00.000Z" })
  @IsOptional()
  @IsDateString()
  endAt?: string

  @ApiProperty({ required: false, example: "UTC" })
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  timezone?: string

  @ApiProperty({ example: "Dakar, Region de Dakar" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  location!: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  coverImage?: string

  @ApiProperty({ required: false, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean
}
