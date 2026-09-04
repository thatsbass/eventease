import { ApiProperty } from "@nestjs/swagger"
import { Transform, Type } from "class-transformer"
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator"

export class CheckoutItemDto {
  @ApiProperty({ example: "ck_ticket_type_id" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  ticketTypeId!: string

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number
}

export class CheckoutRequestDto {
  @ApiProperty({ example: "bytebass-intro-ai-creators-night" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  publicId!: string

  @ApiProperty({ example: "Awa Diop" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  buyerName!: string

  @ApiProperty({ example: "awa@example.com" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  buyerEmail!: string

  @ApiProperty({ required: false, example: "+221771234567" })
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  buyerPhone?: string

  @ApiProperty({ required: false, example: "WAVE" })
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  paymentMethod?: string

  @ApiProperty({ type: [CheckoutItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[]
}
