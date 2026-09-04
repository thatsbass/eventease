import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginDto {
  @ApiProperty({ example: "awa@example.com" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({ example: "password123" })
  @IsString()
  @IsNotEmpty()
  password!: string
}