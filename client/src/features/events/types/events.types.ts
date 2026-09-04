export type OrganizerTimelineStatus = "UPCOMING" | "PAST"

export type PublicEventStatus = "PUBLISHED" | "DRAFT" | "CANCELLED"

export type TicketTier = "standard" | "vip" | "early"

export type TicketType = {
  id: string
  name: string
  description: string
  price: number
  currency: string
  sold: number
  quantity: number
  tier: TicketTier
}

export type OrganizerTimelineEvent = {
  id: string
  publicId: string
  title: string
  description: string
  startAt: string
  endAt?: string | null
  dateLabel: string
  weekday: string
  time: string
  location: string
  invitedCount: number
  coverImage: string
  status: OrganizerTimelineStatus
  publicStatus: PublicEventStatus
  ticketTypes: TicketType[]
}

export type Organizer = {
  id: string
  slug: string
  name: string
  username: string
  bio?: string | null
  role: string
  timezone: string
  avatarUrl: string
  coverImage?: string | null
  isCertified: boolean
  events: OrganizerTimelineEvent[]
}

export type PublicTicketType = TicketType

export type PublicEventOrganizer = {
  id: string
  name: string
  username: string
  avatarUrl?: string | null
  certified: boolean
}

export type PublicEvent = {
  id: string
  publicId: string
  title: string
  description: string
  status: PublicEventStatus
  date: string
  time: string
  location: string
  coverImage?: string | null
  organizer: PublicEventOrganizer
  ticketTypes: PublicTicketType[]
}
