import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator"

export class RegisterDto {
  @ApiProperty({ example: "awa@example.com" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({ example: "Awa Diop" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  fullName!: string

  @ApiProperty({ example: "awa.diop" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  username!: string

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(6)
  password!: string
}