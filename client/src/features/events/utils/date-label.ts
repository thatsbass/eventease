export const getDateLabelParts = (dateLabel?: string | null) => {
  const dateParts = dateLabel?.trim().split(/\s+/).filter(Boolean) ?? []
  const dateDay = dateParts[0] ?? ""
  const dateMonth = dateParts.slice(1).join(" ").toUpperCase()

  return { dateDay, dateMonth }
}
