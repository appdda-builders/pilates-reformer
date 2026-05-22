import { scheduleTimes, type ScheduleSlot } from "@/lib/site/schedule"

export function normalizeScheduleTime(value: string): string {
  const parts = value.trim().split(":")
  if (parts.length < 2) return value.trim()
  const hour = parts[0].padStart(2, "0")
  const minute = parts[1].padStart(2, "0")
  return `${hour}:${minute}`
}

export function getBoardTimes(slots: ScheduleSlot[]): string[] {
  const times = new Set<string>()
  for (const t of scheduleTimes) {
    times.add(t)
  }
  for (const slot of slots) {
    times.add(normalizeScheduleTime(slot.startTime))
  }
  return Array.from(times).sort((a, b) => a.localeCompare(b))
}

export function hasClassAt(
  slots: ScheduleSlot[],
  dayOfWeek: number,
  startTime: string,
): boolean {
  return findSlotAt(slots, dayOfWeek, startTime) != null
}

export function findSlotAt<T extends ScheduleSlot>(
  slots: T[],
  dayOfWeek: number,
  startTime: string,
): T | undefined {
  const time = normalizeScheduleTime(startTime)
  return slots.find(
    (slot) =>
      slot.dayOfWeek === dayOfWeek &&
      normalizeScheduleTime(slot.startTime) === time,
  )
}
