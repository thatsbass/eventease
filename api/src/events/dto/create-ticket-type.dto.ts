import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { TicketTier } from "@prisma/client"
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator"

export class CreateTicketTypeDto {
  @ApiProperty({ example: "Pass Standard" })
  @IsString()
  name!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ example: 25000 })
  @IsInt()
  @Min(0)
  price!: number

  @ApiProperty({ example: "XOF" })
  @IsString()
  currency!: string

  @ApiProperty({ example: 200 })
  @IsInt()
  @Min(0)
  quantity!: number

  @ApiProperty({ enum: TicketTier, default: TicketTier.standard })
  @IsEnum(TicketTier)
  tier!: TicketTier
}