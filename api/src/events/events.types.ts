export const ticketTypeSelect = {
  id: true,
  eventId: true,
  name: true,
  description: true,
  price: true,
  currency: true,
  quantity: true,
  sold: true,
  tier: true,
  createdAt: true,
  updatedAt: true,
} as const

export const organizerSelect = {
  id: true,
  bio: true,
  timezone: true,
  avatarUrl: true,
  coverImage: true,
  user: {
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      certified : true
    },
  },
} as const

export const eventSelect = {
  id: true,
  publicId: true,
  title: true,
  description: true,
  category: true,
  status: true,
  startAt: true,
  endAt: true,
  timezone: true,
  location: true,
  coverImage: true,
  capacity: true,
  requireApproval: true,
  organizerId: true,
  organizer: { select: organizerSelect },
  ticketTypes: { select: ticketTypeSelect },
  createdAt: true,
  updatedAt: true,
} as const
