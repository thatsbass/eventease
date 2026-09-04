import { ApiPropertyOptional } from "@nestjs/swagger"
import { EventCategory, EventStatus } from "@prisma/client"
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator"

export class UpdateEventDto {
  @ApiPropertyOptional({ example: "Nouveau titre" })
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ enum: EventCategory })
  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory

  @ApiPropertyOptional({ enum: EventStatus })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus

  @ApiPropertyOptional({ example: "2026-02-10T13:30:00.000Z" })
  @IsOptional()
  @IsDateString()
  startAt?: string

  @ApiPropertyOptional({ example: "2026-02-10T16:30:00.000Z" })
  @IsOptional()
  @IsDateString()
  endAt?: string

  @ApiPropertyOptional({ example: "UTC" })
  @IsOptional()
  @IsString()
  timezone?: string

  @ApiPropertyOptional({ example: "Dakar" })
  @IsOptional()
  @IsString()
  location?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImage?: string

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean
}
