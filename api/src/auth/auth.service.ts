import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { UserRole } from "@prisma/client"
import * as bcrypt from "bcrypt"
import { LoginDto } from "./dto/login.dto"
import { RegisterDto } from "./dto/register.dto"
import { TokenPayload } from "./auth.types"
import { MESSAGES, RESPONSES } from "src/constants"
import { UserService } from "src/user/user.service"

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async checkEmail(email: string) {
    const exists = await this.users.checkEmailExists(email)
    return { exists }
  }

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const user = await this.users.createOrganizerUser({
      email: dto.email,
      username: dto.username,
      fullName: dto.fullName,
      passwordHash: hashedPassword,
    })

    const tokens = await this.issueTokens(user.id, user.role)
    await this.users.setRefreshTokenHash(user.id, tokens.refresh_token)

    return tokens
  }

  async login(dto: LoginDto) {
    const user = await this.users.getUserForLoginByEmail(dto.email)

    if (!user) {
      throw new UnauthorizedException(MESSAGES.auth.invalidCredentials)
    }

    const ok = await bcrypt.compare(dto.password, user.password)
    if (!ok) {
      throw new UnauthorizedException(MESSAGES.auth.invalidCredentials)
    }

    const tokens = await this.issueTokens(user.id, user.role)
    await this.users.setRefreshTokenHash(user.id, tokens.refresh_token)

    return tokens
  }
  
  async logout(userId: string) {
    await this.users.clearRefreshTokenHash(userId)

    return RESPONSES.ok
  }

  async refresh(refreshToken: string) {
    const { secret, refreshSecret } = this.getSecrets()

    let payload: TokenPayload
    try {
      payload = (await this.jwt.verifyAsync(refreshToken, {
        secret: refreshSecret ?? secret,
      })) as TokenPayload
    } catch {
      throw new UnauthorizedException(MESSAGES.auth.invalidRefreshToken)
    }

    if (payload.typ !== "refresh") {
      throw new UnauthorizedException(MESSAGES.auth.invalidRefreshToken)
    }

    const user = await this.users.getUserForRefreshById(payload.sub)

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException(MESSAGES.auth.invalidRefreshToken)
    }

    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash)
    if (!ok) {
      throw new UnauthorizedException(MESSAGES.auth.invalidRefreshToken)
    }

    const tokens = await this.issueTokens(user.id, user.role)
    await this.users.setRefreshTokenHash(user.id, tokens.refresh_token)

    return tokens
  }


  async me(userId: string) {
    const user = await this.users.getSafeUserById(userId)

    if (!user) {
      throw new UnauthorizedException(MESSAGES.auth.invalidToken)
    }

    return user
  }

  private async issueTokens(userId: string, role: UserRole) {
    const { secret, refreshSecret } = this.getSecrets()
    const accessExp = (this.config.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "7d") as any
    const refreshExp = (this.config.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "30d") as any

    const accessPayload: TokenPayload = { sub: userId, role, typ: "access" }
    const refreshPayload: TokenPayload = { sub: userId, role, typ: "refresh" }

    const access_token = await this.jwt.signAsync(accessPayload, {
      secret,
      expiresIn: accessExp,
    })

    const refresh_token = await this.jwt.signAsync(refreshPayload, {
      secret: refreshSecret ?? secret,
      expiresIn: refreshExp,
    })

    return { access_token, refresh_token }
  }

  private getSecrets() {
    const secret = this.config.get<string>("JWT_SECRET") ?? "dev-secret"
    const refreshSecret = this.config.get<string>("JWT_REFRESH_SECRET")
    return { secret, refreshSecret }
  }
}
