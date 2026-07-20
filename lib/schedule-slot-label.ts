import { scheduleDayLabels } from "@/lib/site/schedule"
import { formatTimeRange12h } from "@/lib/time-utils"

export function formatScheduleSlotLabel(slot: {
  className: string
  dayOfWeek: number
  startTime: string
  endTime?: string | null
  instructor?: string | null
}) {
  const day = scheduleDayLabels.find((d) => d.dayOfWeek === slot.dayOfWeek)?.label ?? "?"
  const time = formatTimeRange12h(slot.startTime, slot.endTime)
  const coach = slot.instructor ? ` · ${slot.instructor}` : ""
  return `${day} ${time} · ${slot.className}${coach}`
}
