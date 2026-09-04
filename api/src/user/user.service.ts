import { BadRequestException, Injectable } from "@nestjs/common"
import { Prisma, UserRole } from "@prisma/client"
import * as bcrypt from "bcrypt"
import { PrismaService } from "src/database/prisma.service"
import { DEFAULTS, MESSAGES } from "src/constants"
import { makeDefaultAvatarUrl } from "src/utils"

const organizerProfileSelect = {
  id: true,
  bio: true,
  timezone: true,
  avatarUrl: true,
  coverImage: true,
  createdAt: true,
  updatedAt: true,
} as const

const userSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
  avatarUrl: true,
  role: true,
  verified: true,
  certified: true,
  organizerProfile: { select: organizerProfileSelect },
  createdAt: true,
  updatedAt: true,
} as const

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async checkEmailExists(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    return Boolean(user)
  }

  async createOrganizerUser(input: {
    email: string
    username: string
    fullName: string
    passwordHash: string
  }) {
    const avatarUrl = makeDefaultAvatarUrl(input.username || input.fullName)

    try {
      return await this.prisma.user.create({
        data: {
          email: input.email,
          username: input.username,
          name: input.fullName,
          password: input.passwordHash,
          avatarUrl,
          role: UserRole.ORGANIZER,
          organizerProfile: {
            create: {
              bio: null,
              timezone: DEFAULTS.timezone,
              avatarUrl,
              coverImage: null,
            },
          },
        },
        select: { id: true, role: true },
      })
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new BadRequestException(MESSAGES.auth.emailOrUsernameInUse)
      }
      throw err
    }
  }

  async getUserForLoginByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        password: true,
      },
    })
  }

  async getUserForRefreshById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        refreshTokenHash: true,
      },
    })
  }

  async getSafeUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    })
  }

  async setRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10)

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
      select: { id: true },
    })
  }

  async clearRefreshTokenHash(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
      select: { id: true },
    })
  }

  async ensureOrganizerProfile(userId: string) {
    await this.prisma.organizerProfile.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        bio: null,
        timezone: DEFAULTS.timezone,
        avatarUrl: null,
        coverImage: null,
      },
      select: { id: true },
    })
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    // Keep both in sync for MVP (User + OrganizerProfile)
    await this.prisma.organizerProfile.upsert({
      where: { id: userId },
      update: { avatarUrl },
      create: {
        id: userId,
        bio: null,
        timezone: DEFAULTS.timezone,
        avatarUrl,
        coverImage: null,
      },
      select: { id: true },
    })

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: userSelect,
    })
  }

  async updateOrganizerCover(userId: string, coverImage: string) {
    return this.prisma.organizerProfile.upsert({
      where: { id: userId },
      update: { coverImage },
      create: {
        id: userId,
        bio: null,
        timezone: DEFAULTS.timezone,
        avatarUrl: null,
        coverImage,
      },
      select: organizerProfileSelect,
    })
  }

  async updateProfile(
    userId: string,
    dto: {
      name?: string
      username?: string
      bio?: string | null
      timezone?: string
    },
  ) {
    const userData: Prisma.UserUpdateInput = {}
    const profileData: Prisma.OrganizerProfileUpdateInput = {}

    if (dto.name !== undefined) userData.name = dto.name
    if (dto.username !== undefined) userData.username = dto.username
    if (dto.bio !== undefined) profileData.bio = dto.bio
    if (dto.timezone !== undefined) profileData.timezone = dto.timezone

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (Object.keys(userData).length > 0) {
          await tx.user.update({
            where: { id: userId },
            data: userData,
            select: { id: true },
          })
        }

        if (Object.keys(profileData).length > 0) {
          await tx.organizerProfile.upsert({
            where: { id: userId },
            update: profileData,
            create: {
              id: userId,
              bio: dto.bio ?? null,
              timezone: dto.timezone ?? DEFAULTS.timezone,
              avatarUrl: null,
              coverImage: null,
            },
            select: { id: true },
          })
        }

        const updated = await tx.user.findUnique({
          where: { id: userId },
          select: userSelect,
        })

        return updated
      })
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new BadRequestException(MESSAGES.auth.emailOrUsernameInUse)
      }
      throw err
    }
  }
}
