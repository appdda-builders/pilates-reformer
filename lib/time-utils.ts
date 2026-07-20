export function endTimeFromStart(startTime: string): string {
  const trimmed = startTime.trim()
  const match = /^(\d{1,2}):(\d{2})/.exec(trimmed)
  if (!match) return trimmed
  const h = Number(match[1])
  const m = Number(match[2])
  if (!Number.isFinite(h) || !Number.isFinite(m)) return trimmed
  const total = h * 60 + m + 60
  const eh = Math.floor(total / 60) % 24
  const em = total % 60
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`
}

export function formatTime12h(time24: string): string {
  const trimmed = time24.trim()
  const match = /^(\d{1,2}):(\d{2})/.exec(trimmed)
  if (!match) return trimmed
  const hour24 = Number(match[1])
  const minute = match[2]
  if (!Number.isFinite(hour24) || hour24 < 0 || hour24 > 23) return trimmed
  const suffix = hour24 >= 12 ? "PM" : "AM"
  let hour12 = hour24 % 12
  if (hour12 === 0) hour12 = 12
  return `${hour12}:${minute} ${suffix}`
}

export function formatTimeRange12h(startTime: string, endTime?: string | null): string {
  const start = formatTime12h(startTime)
  if (endTime == null || endTime.trim() === "") return start
  return `${start} – ${formatTime12h(endTime)}`
}
