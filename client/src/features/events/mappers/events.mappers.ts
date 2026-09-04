import type { AuthUserSnapshot } from "@/features/auth/schemas/auth.schemas"
import type { EventDto, TicketTypeDto } from "../schemas/events.schemas"
import type {
  Organizer,
  OrganizerTimelineEvent,
  PublicEvent,
  PublicEventStatus,
  TicketType,
} from "../types/events.types"
import { getEventDateParts, getEventTimelineStatus } from "../utils/event-datetime"

const DICEBEAR_BASE_URL = "https://api.dicebear.com/9.x/glass/svg?seed="

const makeDicebearUrl = (seed: string) => {
  const safeSeed = encodeURIComponent(seed || "User")
  return `${DICEBEAR_BASE_URL}${safeSeed}`
}

const DEFAULT_COVER_IMAGE =
  "https://res.cloudinary.com/dv9az7nno/image/upload/v1770269612/default-cover_mksocd.avif"

const toPublicStatus = (status: EventDto["status"]): PublicEventStatus => {
  if (status === "PUBLISHED") return "PUBLISHED"
  if (status === "CANCELLED") return "CANCELLED"
  return "DRAFT"
}

const toTicketType = (t: TicketTypeDto): TicketType => ({
  id: t.id,
  name: t.name,
  description: t.description ?? "",
  price: t.price,
  currency: t.currency,
  sold: t.sold,
  quantity: t.quantity,
  tier: t.tier,
})

export const toPublicEvent = (event: EventDto): PublicEvent => {
  const { weekday, dateLabel, time } = getEventDateParts(event.startAt, event.timezone)
  const date = `${weekday} ${dateLabel}`.trim()

  const organizerName = event.organizer.user.name?.trim() || event.organizer.user.username

  return {
    id: event.id,
    publicId: event.publicId,
    title: event.title,
    description: event.description ?? "",
    status: toPublicStatus(event.status),
    date,
    time,
    location: event.location,
    coverImage: event.coverImage,
    organizer: {
      id: event.organizer.user.id,
      name: organizerName,
      username: event.organizer.user.username,
      avatarUrl: event.organizer.avatarUrl ?? event.organizer.user.avatarUrl,
      certified: event.organizer.user.certified
    },
    ticketTypes: event.ticketTypes.map(toTicketType),
  }
}

export const toOrganizerTimelineEvent = (event: EventDto): OrganizerTimelineEvent => {
  const { weekday, dateLabel, time } = getEventDateParts(event.startAt, event.timezone)

  return {
    id: event.id,
    publicId: event.publicId,
    title: event.title,
    description: event.description ?? "",
    startAt: event.startAt,
    endAt: event.endAt,
    dateLabel,
    weekday,
    time,
    location: event.location,
    invitedCount: 0,
    coverImage: event.coverImage || DEFAULT_COVER_IMAGE,
    status: getEventTimelineStatus(event.startAt),
    publicStatus: toPublicStatus(event.status),
    ticketTypes: event.ticketTypes.map(toTicketType),
  }
}

export const toOrganizer = (user: AuthUserSnapshot | null, events: OrganizerTimelineEvent[]): Organizer => {
  const username = user?.username?.trim() || "user"
  const name = user?.name?.trim() || username

  return {
    id: user?.id ?? "",
    slug: username,
    name,
    username,
    bio: null,
    role: "Organisateur",
    timezone: "UTC",
    avatarUrl: user?.avatarUrl?.trim() || makeDicebearUrl(name),
    isCertified: Boolean(user?.certified),
    events,
  }
}
