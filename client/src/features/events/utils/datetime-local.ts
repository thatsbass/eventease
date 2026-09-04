const pad2 = (value: number) => String(value).padStart(2, "0")

/**
 * Convert an ISO string to a `datetime-local` value (YYYY-MM-DDTHH:mm) in UTC.
 * This keeps the app consistent because the MVP displays times as UTC.
 */
export const isoToUtcDateTimeLocal = (iso: string | null | undefined) => {
  if (!iso) return ""

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""

  const yyyy = date.getUTCFullYear()
  const mm = pad2(date.getUTCMonth() + 1)
  const dd = pad2(date.getUTCDate())
  const hh = pad2(date.getUTCHours())
  const min = pad2(date.getUTCMinutes())

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

const datetimeLocalToUtcIsoString = (value: string) => {
  const v = value.trim()

  // HTML input value is typically: "YYYY-MM-DDTHH:mm"
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return `${v}:00.000Z`

  // Sometimes (manual input): "YYYY-MM-DDTHH:mm:ss"
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(v)) return `${v}.000Z`

  // Or already a full ISO (e.g. from an API): keep it.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v)) return v

  throw new Error("Format de date invalide.")
}

/**
 * Interpret a `datetime-local` value as UTC and return an ISO string.
 */
export const utcDateTimeLocalToIso = (value: string) => {
  const iso = datetimeLocalToUtcIsoString(value)
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) throw new Error("Date invalide.")
  return date.toISOString()
}

