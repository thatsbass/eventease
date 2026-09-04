import { DEFAULTS } from "src/constants"
import crypto from "crypto"

export const makeDefaultAvatarUrl = (seed: string) => {
  const raw = (seed ?? "user").trim() || "user"
  const safe = encodeURIComponent(raw)
  return `https://api.dicebear.com/9.x/glass/svg?seed=${safe}`
}


const slugify = (input: string) => {
  const s = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")

  return s.length ? s : DEFAULTS.event.slugFallback
}

export const makePublicId = (title: string) => {
  const base = slugify(title)
  const short = crypto.randomUUID().split("-")[0]
  return `${base}-${short}`
}
