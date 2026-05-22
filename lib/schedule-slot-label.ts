import { scheduleDayLabels } from "@/lib/site/schedule"

export function formatScheduleSlotLabel(slot: {
  className: string
  dayOfWeek: number
  startTime: string
  endTime?: string | null
  instructor?: string | null
}) {
  const day = scheduleDayLabels.find((d) => d.dayOfWeek === slot.dayOfWeek)?.label ?? "?"
  const time = slot.endTime ? `${slot.startTime} – ${slot.endTime}` : slot.startTime
  const coach = slot.instructor ? ` · ${slot.instructor}` : ""
  return `${day} ${time} · ${slot.className}${coach}`
}
