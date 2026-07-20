import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { and, eq, gte, lte } from "drizzle-orm"
import {
  bookingDateAtNoon,
  dateRangeForDay,
  toLocalDateStr,
} from "@/lib/booking-slot-options"

export async function isSlotDisabledOnDate(
  db: AnyDb,
  scheduleSlotId: string,
  bookingDate: Date | string,
): Promise<boolean> {
  const dateStr = typeof bookingDate === "string" ? bookingDate : toLocalDateStr(bookingDate)
  const { start, end } = dateRangeForDay(dateStr)
  const [row] = await db
    .select({ id: schema.scheduleSlotException.id })
    .from(schema.scheduleSlotException)
    .where(
      and(
        eq(schema.scheduleSlotException.scheduleSlotId, scheduleSlotId),
        gte(schema.scheduleSlotException.exceptionDate, start),
        lte(schema.scheduleSlotException.exceptionDate, end),
      ),
    )
    .limit(1)
  return row != null
}

export async function listDisabledSlotDateKeys(
  db: AnyDb,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<Set<string>> {
  const rows = await db
    .select({
      scheduleSlotId: schema.scheduleSlotException.scheduleSlotId,
      exceptionDate: schema.scheduleSlotException.exceptionDate,
    })
    .from(schema.scheduleSlotException)
    .where(
      and(
        gte(schema.scheduleSlotException.exceptionDate, rangeStart),
        lte(schema.scheduleSlotException.exceptionDate, rangeEnd),
      ),
    )

  const keys = new Set<string>()
  for (const row of rows) {
    const dateStr = toLocalDateStr(
      row.exceptionDate instanceof Date
        ? row.exceptionDate
        : new Date(row.exceptionDate as unknown as number),
    )
    keys.add(`${row.scheduleSlotId}|${dateStr}`)
  }
  return keys
}

export async function listExceptionDateStrsForSlot(
  db: AnyDb,
  scheduleSlotId: string,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<string[]> {
  const rows = await db
    .select({ exceptionDate: schema.scheduleSlotException.exceptionDate })
    .from(schema.scheduleSlotException)
    .where(
      and(
        eq(schema.scheduleSlotException.scheduleSlotId, scheduleSlotId),
        gte(schema.scheduleSlotException.exceptionDate, rangeStart),
        lte(schema.scheduleSlotException.exceptionDate, rangeEnd),
      ),
    )

  return rows.map((row) =>
    toLocalDateStr(
      row.exceptionDate instanceof Date
        ? row.exceptionDate
        : new Date(row.exceptionDate as unknown as number),
    ),
  )
}

export async function setSlotDisabledForDate(
  db: AnyDb,
  scheduleSlotId: string,
  dateStr: string,
  disabled: boolean,
  reason?: string | null,
): Promise<void> {
  const { start, end } = dateRangeForDay(dateStr)

  if (!disabled) {
    await db
      .delete(schema.scheduleSlotException)
      .where(
        and(
          eq(schema.scheduleSlotException.scheduleSlotId, scheduleSlotId),
          gte(schema.scheduleSlotException.exceptionDate, start),
          lte(schema.scheduleSlotException.exceptionDate, end),
        ),
      )
    return
  }

  const existing = await isSlotDisabledOnDate(db, scheduleSlotId, dateStr)
  if (existing) return

  await db.insert(schema.scheduleSlotException).values({
    id: crypto.randomUUID(),
    scheduleSlotId,
    exceptionDate: bookingDateAtNoon(dateStr),
    reason: reason ?? null,
  })
}
