import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { AuthService } from "./auth.service"
import { CheckEmailDto } from "./dto/check-email.dto"
import { RegisterDto } from "./dto/register.dto"
import { LoginDto } from "./dto/login.dto"
import { RefreshDto } from "./dto/refresh.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { SWAGGER } from "src/constants"

@ApiTags(SWAGGER.tags.auth)
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("check-email")
  @ApiOperation({ summary: SWAGGER.auth.checkEmail })
  checkEmail(@Body() dto: CheckEmailDto) {
    return this.authService.checkEmail(dto.email)
  }

  @Post("register")
  @ApiOperation({ summary: SWAGGER.auth.register })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post("login")
  @ApiOperation({ summary: SWAGGER.auth.login })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post("refresh")
  @ApiOperation({ summary: SWAGGER.auth.refresh })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token)
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.auth.logout })
  logout(@Req() req: any) {
    return this.authService.logout(req.user.sub)
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER.auth.me })
  me(@Req() req: any) {
    return this.authService.me(req.user.sub)
  }
}
