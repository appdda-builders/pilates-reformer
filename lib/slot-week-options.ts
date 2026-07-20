import { toLocalDateStr } from "@/lib/booking-slot-options"
import { getMondayOfWeek } from "@/lib/site/schedule"

export function occurrenceDateForWeek(
  dayOfWeek: number,
  weekMonday: Date,
): Date {
  const d = new Date(weekMonday)
  d.setHours(12, 0, 0, 0)
  if (dayOfWeek === 0) {
    d.setDate(d.getDate() + 6)
  } else {
    d.setDate(d.getDate() + (dayOfWeek - 1))
  }
  return d
}

export function upcomingWeekOptions(count: number = 8, from: Date = new Date()) {
  const options: { weekOffset: number; monday: Date; mondayStr: string; label: string }[] = []
  for (let i = 0; i < count; i++) {
    const monday = getMondayOfWeek(from, i)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" })
    options.push({
      weekOffset: i,
      monday,
      mondayStr: toLocalDateStr(monday),
      label:
        i === 0
          ? `Esta semana (${fmt.format(monday)} – ${fmt.format(sunday)})`
          : `${fmt.format(monday)} – ${fmt.format(sunday)}`,
    })
  }
  return options
}
