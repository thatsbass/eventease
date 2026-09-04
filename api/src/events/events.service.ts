import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { EventStatus, Prisma } from "@prisma/client"
import { PrismaService } from "src/database/prisma.service"
import { DEFAULTS, MESSAGES } from "src/constants"
import { UserService } from "src/user/user.service"
import { CreateEventDto } from "./dto/create-event.dto"
import { UpdateEventDto } from "./dto/update-event.dto"
import { CreateTicketTypeDto } from "./dto/create-ticket-type.dto"
import { UpdateTicketTypeDto } from "./dto/update-ticket-type.dto"
import { makePublicId } from "src/utils"
import { eventSelect, ticketTypeSelect } from "./events.types"

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UserService,
  ) {}

  listPublic() {
    return this.prisma.event.findMany({
      where: { status: EventStatus.PUBLISHED },
      orderBy: { startAt: "asc" },
      select: eventSelect,
    })
  }

  async getPublicByPublicId(publicId: string) {
    const event = await this.prisma.event.findFirst({
      where: { publicId, status: EventStatus.PUBLISHED },
      select: eventSelect,
    })

    if (!event) {
      throw new NotFoundException(MESSAGES.events.eventNotFound)
    }

    return event
  }

  listMine(userId: string) {
    return this.prisma.event.findMany({
      where: { organizerId: userId },
      orderBy: { createdAt: "desc" },
      select: eventSelect,
    })
  }

  async getById(userId: string, id: string) {
    return this.getOwnedEventOrThrow(userId, id)
  }

  async create(userId: string, dto: CreateEventDto) {
    await this.users.ensureOrganizerProfile(userId)

    /**
     * NOTE : Generate unique publicId server-side
     */
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const publicId = makePublicId(dto.title)

      try {
        return await this.prisma.event.create({
          data: {
            publicId,
            title: dto.title,
            description: dto.description,
            category: dto.category,
            status: dto.status,
            startAt: new Date(dto.startAt),
            endAt: dto.endAt ? new Date(dto.endAt) : undefined,
            timezone: dto.timezone,
            location: dto.location,
            coverImage: dto.coverImage?.trim() || DEFAULTS.event.coverImage,
            capacity: dto.capacity,
            requireApproval: dto.requireApproval,
            organizerId: userId,
          },
          select: eventSelect,
        })
      } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          continue
        }
        throw err
      }
    }

    throw new InternalServerErrorException(MESSAGES.events.publicIdGenerationFailed)
  }

  async update(userId: string, id: string, dto: UpdateEventDto) {
    await this.assertOwnsEvent(userId, id)

    return this.prisma.event.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        status: dto.status,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        timezone: dto.timezone,
        location: dto.location,
        coverImage: dto.coverImage,
        capacity: dto.capacity,
        requireApproval: dto.requireApproval,
      },
      select: eventSelect,
    })
  }

  async updateCover(userId: string, id: string, coverImage: string) {
    await this.assertOwnsEvent(userId, id)

    return this.prisma.event.update({
      where: { id },
      data: { coverImage },
      select: eventSelect,
    })
  }

  async publish(userId: string, id: string) {
    await this.assertOwnsEvent(userId, id)

    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.PUBLISHED },
      select: eventSelect,
    })
  }

  async unpublish(userId: string, id: string) {
    await this.assertOwnsEvent(userId, id)

    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.DRAFT },
      select: eventSelect,
    })
  }

  async delete(userId: string, id: string) {
    await this.assertOwnsEvent(userId, id)
    return this.prisma.event.delete({ where: { id } })
  }

  async addTicketType(userId: string, eventId: string, dto: CreateTicketTypeDto) {
    await this.assertOwnsEvent(userId, eventId)

    return this.prisma.ticketType.create({
      data: {
        eventId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        currency: dto.currency,
        quantity: dto.quantity,
        tier: dto.tier,
      },
      select: ticketTypeSelect,
    })
  }

  async updateTicketType(userId: string, ticketTypeId: string, dto: UpdateTicketTypeDto) {
    await this.assertOwnsTicketType(userId, ticketTypeId)

    return this.prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        currency: dto.currency,
        quantity: dto.quantity,
        tier: dto.tier,
      },
      select: ticketTypeSelect,
    })
  }

  async deleteTicketType(userId: string, ticketTypeId: string) {
    await this.assertOwnsTicketType(userId, ticketTypeId)
    return this.prisma.ticketType.delete({ where: { id: ticketTypeId } })
  }

  private async assertOwnsEvent(userId: string, eventId: string) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizerId: userId },
      select: { id: true },
    })

    if (!event) {
      throw new NotFoundException(MESSAGES.events.eventNotFound)
    }
  }

  private async getOwnedEventOrThrow(userId: string, eventId: string) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizerId: userId },
      select: eventSelect,
    })

    if (!event) {
      throw new NotFoundException(MESSAGES.events.eventNotFound)
    }

    return event
  }

  private async assertOwnsTicketType(userId: string, ticketTypeId: string) {
    const ticketType = await this.prisma.ticketType.findFirst({
      where: { id: ticketTypeId, event: { organizerId: userId } },
      select: { id: true },
    })

    if (!ticketType) {
      throw new NotFoundException(MESSAGES.events.ticketTypeNotFound)
    }
  }
}
