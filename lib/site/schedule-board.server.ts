import "server-only"

import { and, eq, gte, lte } from "drizzle-orm"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { toLocalDateStr } from "@/lib/booking-slot-options"
import { getMondayOfWeek, type PublicScheduleSlot } from "@/lib/site/schedule"
import { normalizeScheduleTime } from "@/lib/site/schedule-board-utils"
export type LandingScheduleBoard = {
  slots: PublicScheduleSlot[]
  enrollments: Record<string, number>
}

function enrollmentKey(slotId: string, dateStr: string) {
  return `${slotId}|${dateStr}`
}

export async function loadLandingScheduleBoard(): Promise<LandingScheduleBoard> {
  try {
    const db = getDb()
    const rows = await db
      .select({
        id: schema.scheduleSlot.id,
        dayOfWeek: schema.scheduleSlot.dayOfWeek,
        startTime: schema.scheduleSlot.startTime,
        capacity: schema.scheduleSlot.capacity,
      })
      .from(schema.scheduleSlot)
      .where(eq(schema.scheduleSlot.isActive, true))

    if (rows.length === 0) {
      return { slots: [], enrollments: {} }
    }

    const slots: PublicScheduleSlot[] = rows.map((row) => ({
      id: row.id,
      dayOfWeek: row.dayOfWeek,
      startTime: normalizeScheduleTime(row.startTime),
      capacity: row.capacity,
    }))

    const monday = getMondayOfWeek(new Date(), 0)
    const rangeStart = new Date(monday)
    rangeStart.setDate(rangeStart.getDate() - 7 * 12)
    rangeStart.setHours(0, 0, 0, 0)
    const rangeEnd = new Date(monday)
    rangeEnd.setDate(rangeEnd.getDate() + 7 * 12 + 6)
    rangeEnd.setHours(23, 59, 59, 999)

    const bookings = await db
      .select({
        slotId: schema.booking.scheduleSlotId,
        bookingDate: schema.booking.bookingDate,
      })
      .from(schema.booking)
      .where(
        and(
          eq(schema.booking.status, "confirmed"),
          gte(schema.booking.bookingDate, rangeStart),
          lte(schema.booking.bookingDate, rangeEnd),
        ),
      )

    const enrollments: Record<string, number> = {}
    for (const row of bookings) {
      const dateStr = toLocalDateStr(row.bookingDate)
      const key = enrollmentKey(row.slotId, dateStr)
      enrollments[key] = (enrollments[key] ?? 0) + 1
    }

    return { slots, enrollments }
  } catch {
    return { slots: [], enrollments: {} }
  }
}
