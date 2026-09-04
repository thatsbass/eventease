export type OrderTicketsPdfData = {
  eventTitle: string
  eventPublicId: string
  startAt: Date
  timezone?: string
  location: string
  buyerName: string
  buyerEmail: string
  tickets: {
    code: string
    ticketTypeName: string
    tier?: string
  }[]
}

