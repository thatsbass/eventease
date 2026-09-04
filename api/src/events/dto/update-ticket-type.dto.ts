import { ApiPropertyOptional } from "@nestjs/swagger"
import { TicketTier } from "@prisma/client"
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator"

export class UpdateTicketTypeDto {
  @ApiPropertyOptional({ example: "Pass Standard" })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: 25000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number

  @ApiPropertyOptional({ example: "XOF" })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number

  @ApiPropertyOptional({ enum: TicketTier })
  @IsOptional()
  @IsEnum(TicketTier)
  tier?: TicketTier
}