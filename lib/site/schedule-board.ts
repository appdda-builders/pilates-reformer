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

export function boardEnrollmentKey(slotId: string, dateStr: string): string {
  return `${slotId}|${dateStr}`
}

export function getBoardEnrolledCount(
  enrollments: Record<string, number>,
  slotId: string,
  dateStr: string,
): number {
  return enrollments[boardEnrollmentKey(slotId, dateStr)] ?? 0
}

export function isBoardSlotDisabled(
  disabledSlotDateKeys: Iterable<string> | undefined,
  slotId: string,
  dateStr: string,
): boolean {
  if (disabledSlotDateKeys == null) return false
  const key = boardEnrollmentKey(slotId, dateStr)
  if (disabledSlotDateKeys instanceof Set) {
    return disabledSlotDateKeys.has(key)
  }
  for (const item of disabledSlotDateKeys) {
    if (item === key) return true
  }
  return false
}

export function isBoardSlotFull(enrolled: number, capacity: number): boolean {
  return enrolled >= capacity
}

export function canOpenBookingFromBoard(params: {
  enrolled: number
  capacity: number
  disabled: boolean
}): boolean {
  if (params.disabled) return false
  if (isBoardSlotFull(params.enrolled, params.capacity)) return false
  return true
}
