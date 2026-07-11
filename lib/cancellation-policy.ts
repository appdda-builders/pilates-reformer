import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import {
  studioDateStrFromInstant,
  studioLocalDateTimeToInstant,
} from "@/lib/studio-month"

export type StudioCancellationPolicy = {
  cancelMinutes: number
  lateCancelPenalty: boolean
}

export type CancellationCheckResult =
  | { ok: true; restoreClass: boolean; late: boolean }
  | { ok: false; message: string }

export function classStartFromBooking(bookingDate: Date, startTime: string): Date {
  const dateStr = studioDateStrFromInstant(bookingDate)
  const parts = startTime.trim().split(":")
  const h = Number.parseInt(parts[0], 10)
  const m = Number.parseInt(parts[1] ?? "0", 10)
  const hour = Number.isNaN(h) ? 0 : h
  const minute = Number.isNaN(m) ? 0 : m
  return studioLocalDateTimeToInstant(dateStr, hour, minute)
}

export function classEndFromBooking(
  bookingDate: Date,
  startTime: string,
  endTime: string | null,
): Date {
  if (endTime != null && endTime.trim() !== "") {
    return classStartFromBooking(bookingDate, endTime)
  }
  const start = classStartFromBooking(bookingDate, startTime)
  return new Date(start.getTime() + 60 * 60 * 1000)
}

export const BOOKING_CUTOFF_MINUTES_BEFORE_END = 5

export function hoursUntilClass(now: Date, classStart: Date): number {
  return (classStart.getTime() - now.getTime()) / (1000 * 60 * 60)
}

export function minutesUntilClass(now: Date, classStart: Date): number {
  return (classStart.getTime() - now.getTime()) / (1000 * 60)
}

export function minimumCancelMinutes(policy: StudioCancellationPolicy): number {
  return policy.cancelMinutes
}

export function formatMinimumCancelNotice(cancelMinutes: number): string {
  if (cancelMinutes <= 0) return "0 minutos"
  if (cancelMinutes % 60 === 0 && cancelMinutes >= 60) {
    const hours = cancelMinutes / 60
    if (hours === 1) return "60 minutos"
    return `${hours} horas`
  }
  return `${cancelMinutes} minutos`
}

export function evaluateCancellation(
  now: Date,
  classStart: Date,
  policy: StudioCancellationPolicy,
): CancellationCheckResult {
  const minutesLeft = minutesUntilClass(now, classStart)
  const minMinutes = minimumCancelMinutes(policy)

  if (minutesLeft <= 0) {
    return {
      ok: false,
      message: "No se puede cancelar: la clase ya comenzó o ya pasó.",
    }
  }

  if (minutesLeft < minMinutes) {
    return {
      ok: false,
      message: `No se puede cancelar: debes hacerlo al menos ${formatMinimumCancelNotice(policy.cancelMinutes)} antes de la clase.`,
    }
  }

  return { ok: true, restoreClass: true, late: false }
}

export function evaluateAlumnoSelfCancellation(
  now: Date,
  classStart: Date,
  policy: StudioCancellationPolicy,
  selfRelease: { ok: true } | { ok: false; message: string },
): CancellationCheckResult {
  if (!selfRelease.ok) {
    return { ok: false, message: selfRelease.message }
  }
  return evaluateCancellation(now, classStart, policy)
}

export function minutesUntilClassEnd(now: Date, classEnd: Date): number {
  return (classEnd.getTime() - now.getTime()) / (1000 * 60)
}

export function evaluateBookingAllowed(
  now: Date,
  classEnd: Date,
): CancellationCheckResult {
  const minutesUntilEnd = minutesUntilClassEnd(now, classEnd)

  if (minutesUntilEnd < BOOKING_CUTOFF_MINUTES_BEFORE_END) {
    return {
      ok: false,
      message:
        minutesUntilEnd <= 0
          ? "No se puede reservar: la clase ya terminó."
          : "No se puede reservar: faltan menos de 5 minutos para que termine la clase.",
    }
  }

  return { ok: true, restoreClass: true, late: false }
}

export async function loadStudioCancellationPolicy(db: AnyDb): Promise<StudioCancellationPolicy> {
  const [row] = await db
    .select({
      cancelMinutes: schema.studioPolicy.cancelMinutes,
      cancelHours: schema.studioPolicy.cancelHours,
      lateCancelPenalty: schema.studioPolicy.lateCancelPenalty,
    })
    .from(schema.studioPolicy)
    .where(eq(schema.studioPolicy.id, "main"))
    .limit(1)

  const cancelMinutes =
    row?.cancelMinutes ??
    (row?.cancelHours != null ? row.cancelHours * 60 : 90)

  return {
    cancelMinutes,
    lateCancelPenalty: row?.lateCancelPenalty ?? true,
  }
}
