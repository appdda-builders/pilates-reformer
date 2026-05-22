export function endTimeFromStart(startTime: string): string {
  const trimmed = startTime.trim()
  const match = /^(\d{2}):(\d{2})$/.exec(trimmed)
  if (!match) return trimmed
  const h = Number(match[1])
  const m = Number(match[2])
  const total = h * 60 + m + 60
  const eh = Math.floor(total / 60) % 24
  const em = total % 60
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`
}
