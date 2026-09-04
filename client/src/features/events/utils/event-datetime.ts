import type { OrganizerTimelineStatus } from "../types/events.types"

export type EventDateParts = {
  weekday: string
  dateLabel: string
  time: string
}

const DEFAULT_TIMEZONE = "UTC"

export const getEventDateParts = (iso: string, timeZone?: string | null): EventDateParts => {
  const tz = (timeZone || DEFAULT_TIMEZONE).trim() || DEFAULT_TIMEZONE

  try {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) {
      return { weekday: "", dateLabel: "", time: "" }
    }

    const weekday = new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      timeZone: tz,
    }).format(date)

    const dateLabel = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      timeZone: tz,
    }).format(date)

    const time = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: tz,
    }).format(date)

    return { weekday, dateLabel, time }
  } catch {
    return { weekday: "", dateLabel: "", time: "" }
  }
}

export const getEventTimelineStatus = (iso: string): OrganizerTimelineStatus => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "UPCOMING"

  return date.getTime() < Date.now() ? "PAST" : "UPCOMING"
}
