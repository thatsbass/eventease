import { apiFetch } from "@/lib/api/client"
import {
  createEventRequestSchema,
  createTicketTypeRequestSchema,
  updateEventRequestSchema,
  updateTicketTypeRequestSchema,
  type CreateEventRequest,
  type CreateTicketTypeRequest,
  type UpdateEventRequest,
  type UpdateTicketTypeRequest,
} from "../schemas/events.requests"
import { eventDtoListSchema, eventDtoSchema, ticketTypeDtoSchema } from "../schemas/events.schemas"

export const eventsApi = {
  listPublic: async () => {
    return apiFetch("/events/public", { method: "GET" }, eventDtoListSchema)
  },

  getPublicByPublicId: async (publicId: string) => {
    const safe = encodeURIComponent(publicId)

    return apiFetch(`/events/public/${safe}`, { method: "GET" }, eventDtoSchema)
  },

  listMine: async () => {
    return apiFetch("/events/mine", { method: "GET", auth: true }, eventDtoListSchema)
  },

  getMineById: async (eventId: string) => {
    const safe = encodeURIComponent(eventId)

    return apiFetch(`/events/${safe}`, { method: "GET", auth: true }, eventDtoSchema)
  },

  create: async (values: CreateEventRequest) => {
    const body = createEventRequestSchema.parse(values)

    return apiFetch(
      "/events",
      {
        method: "POST",
        auth: true,
        body: JSON.stringify(body),
      },
      eventDtoSchema,
    )
  },

  update: async (eventId: string, values: UpdateEventRequest) => {
    const safe = encodeURIComponent(eventId)
    const body = updateEventRequestSchema.parse(values)

    return apiFetch(
      `/events/${safe}`,
      {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(body),
      },
      eventDtoSchema,
    )
  },

  publish: async (eventId: string) => {
    const safe = encodeURIComponent(eventId)

    return apiFetch(
      `/events/${safe}/publish`,
      {
        method: "PATCH",
        auth: true,
      },
      eventDtoSchema,
    )
  },

  unpublish: async (eventId: string) => {
    const safe = encodeURIComponent(eventId)

    return apiFetch(
      `/events/${safe}/unpublish`,
      {
        method: "PATCH",
        auth: true,
      },
      eventDtoSchema,
    )
  },

  uploadCover: async (eventId: string, file: File) => {
    const safe = encodeURIComponent(eventId)

    const form = new FormData()
    form.append("file", file)

    return apiFetch(
      `/events/${safe}/cover/upload`,
      {
        method: "POST",
        auth: true,
        body: form,
      },
      eventDtoSchema,
    )
  },

  createTicketType: async (eventId: string, values: CreateTicketTypeRequest) => {
    const safe = encodeURIComponent(eventId)
    const body = createTicketTypeRequestSchema.parse(values)

    return apiFetch(
      `/events/${safe}/ticket-types`,
      {
        method: "POST",
        auth: true,
        body: JSON.stringify(body),
      },
      ticketTypeDtoSchema,
    )
  },

  updateTicketType: async (ticketTypeId: string, values: UpdateTicketTypeRequest) => {
    const safe = encodeURIComponent(ticketTypeId)
    const body = updateTicketTypeRequestSchema.parse(values)

    return apiFetch(
      `/events/ticket-types/${safe}`,
      {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(body),
      },
      ticketTypeDtoSchema,
    )
  },

  deleteTicketType: async (ticketTypeId: string) => {
    const safe = encodeURIComponent(ticketTypeId)

    await apiFetch(`/events/ticket-types/${safe}`, {
      method: "DELETE",
      auth: true,
    })
  },
}
