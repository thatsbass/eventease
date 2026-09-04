export const getInvitedLabel = (invitedCount?: number | null) => {
  if (invitedCount == null) return ""
  if (invitedCount <= 0) return "Aucun invite"

  return `${invitedCount} invite${invitedCount > 1 ? "s" : ""}`
}
