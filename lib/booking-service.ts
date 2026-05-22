import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { and, eq, gte, lte } from "drizzle-orm"
import { dateRangeForDay, toLocalDateStr } from "@/lib/booking-slot-options"
import { validateBookingAgeForSlot } from "@/lib/booking-rules"
import {
  classStartFromBooking,
  evaluateCancellation,
  loadStudioCancellationPolicy,
} from "@/lib/cancellation-policy"
import { consumeClassFromSubscription, restoreClassToSubscription } from "@/lib/subscription-logic"

export type CreateBookingResult =
  | { ok: true; bookingId: string; userName: string }
  | { ok: false; message: string }

export async function findUserByDisplayId(db: AnyDb, displayIdRaw: string) {
  const displayId = displayIdRaw.trim().toUpperCase()
  if (!displayId) return null
  const [row] = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      birthdate: schema.user.birthdate,
      role: schema.user.role,
    })
    .from(schema.user)
    .where(eq(schema.user.displayId, displayId))
    .limit(1)
  return row ?? null
}

export async function userHasBookingForSlot(
  db: AnyDb,
  userId: string,
  scheduleSlotId: string,
  bookingDate: Date,
): Promise<boolean> {
  const dateStr = toLocalDateStr(bookingDate)
  const { start, end } = dateRangeForDay(dateStr)
  const [row] = await db
    .select({ id: schema.booking.id })
    .from(schema.booking)
    .where(
      and(
        eq(schema.booking.userId, userId),
        eq(schema.booking.scheduleSlotId, scheduleSlotId),
        eq(schema.booking.status, "confirmed"),
        gte(schema.booking.bookingDate, start),
        lte(schema.booking.bookingDate, end),
      ),
    )
    .limit(1)
  return row != null
}

export async function createBookingForUser(
  db: AnyDb,
  params: {
    userId: string
    scheduleSlotId: string
    bookingDate: Date
    birthdate?: string | null
  },
): Promise<CreateBookingResult> {
  const [slot] = await db
    .select({
      id: schema.scheduleSlot.id,
      dayOfWeek: schema.scheduleSlot.dayOfWeek,
      startTime: schema.scheduleSlot.startTime,
      classType: schema.scheduleSlot.classType,
      isActive: schema.scheduleSlot.isActive,
    })
    .from(schema.scheduleSlot)
    .where(eq(schema.scheduleSlot.id, params.scheduleSlotId))
    .limit(1)

  if (!slot || !slot.isActive) {
    return { ok: false, message: "Horario no disponible" }
  }

  const ageCheck = validateBookingAgeForSlot(
    params.birthdate,
    slot.dayOfWeek,
    slot.startTime,
    params.bookingDate,
    slot.classType,
  )
  if (!ageCheck.ok) {
    return { ok: false, message: ageCheck.message }
  }

  const alreadyBooked = await userHasBookingForSlot(
    db,
    params.userId,
    params.scheduleSlotId,
    params.bookingDate,
  )
  if (alreadyBooked) {
    return {
      ok: false,
      message: "Esta persona ya tiene una reserva confirmada para esa clase en esa fecha",
    }
  }

  const bookingId = crypto.randomUUID()
  await db.insert(schema.booking).values({
    id: bookingId,
    userId: params.userId,
    scheduleSlotId: params.scheduleSlotId,
    bookingDate: params.bookingDate,
    status: "confirmed",
  })

  const [activeSub] = await db
    .select({ id: schema.subscription.id })
    .from(schema.subscription)
    .where(
      and(
        eq(schema.subscription.userId, params.userId),
        eq(schema.subscription.status, "active"),
      ),
    )
    .limit(1)

  if (activeSub) {
    await consumeClassFromSubscription(activeSub.id)
  }

  const [user] = await db
    .select({ name: schema.user.name })
    .from(schema.user)
    .where(eq(schema.user.id, params.userId))
    .limit(1)

  return {
    ok: true,
    bookingId,
    userName: user?.name ?? "Usuario",
  }
}

export type CancelBookingResult =
  | { ok: true; late: boolean; restoredClass: boolean }
  | { ok: false; message: string }

export async function cancelBookingById(
  db: AnyDb,
  bookingId: string,
  options?: { bypassPolicy?: boolean },
): Promise<CancelBookingResult> {
  const [booking] = await db
    .select({
      id: schema.booking.id,
      userId: schema.booking.userId,
      status: schema.booking.status,
      bookingDate: schema.booking.bookingDate,
      startTime: schema.scheduleSlot.startTime,
    })
    .from(schema.booking)
    .innerJoin(schema.scheduleSlot, eq(schema.booking.scheduleSlotId, schema.scheduleSlot.id))
    .where(eq(schema.booking.id, bookingId))
    .limit(1)

  if (!booking) {
    return { ok: false, message: "Reserva no encontrada" }
  }

  if (booking.status !== "confirmed") {
    return { ok: false, message: "Esta reserva ya no está confirmada" }
  }

  const classStart = classStartFromBooking(
    booking.bookingDate instanceof Date
      ? booking.bookingDate
      : new Date(booking.bookingDate as unknown as number),
    booking.startTime,
  )

  let restoreClass = false
  let late = false

  if (!options?.bypassPolicy) {
    const policy = await loadStudioCancellationPolicy(db)
    const check = evaluateCancellation(new Date(), classStart, policy)
    if (!check.ok) {
      return { ok: false, message: check.message }
    }
    restoreClass = check.restoreClass
    late = check.late
  } else {
    restoreClass = true
  }

  await db
    .update(schema.booking)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(eq(schema.booking.id, bookingId))

  if (restoreClass) {
    const [activeSub] = await db
      .select({ id: schema.subscription.id })
      .from(schema.subscription)
      .where(
        and(
          eq(schema.subscription.userId, booking.userId),
          eq(schema.subscription.status, "active"),
        ),
      )
      .limit(1)

    if (activeSub) {
      await restoreClassToSubscription(activeSub.id)
    }
  }

  return { ok: true, late, restoredClass: restoreClass }
}
