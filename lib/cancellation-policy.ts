import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export type StudioCancellationPolicy = {
  cancelHours: number
  lateCancelPenalty: boolean
}

export type CancellationCheckResult =
  | { ok: true; restoreClass: boolean; late: boolean }
  | { ok: false; message: string }

export function classStartFromBooking(bookingDate: Date, startTime: string): Date {
  const d = new Date(bookingDate)
  const parts = startTime.trim().split(":")
  const h = Number.parseInt(parts[0], 10)
  const m = Number.parseInt(parts[1] ?? "0", 10)
  d.setHours(Number.isNaN(h) ? 0 : h, Number.isNaN(m) ? 0 : m, 0, 0)
  return d
}

export function hoursUntilClass(now: Date, classStart: Date): number {
  return (classStart.getTime() - now.getTime()) / (1000 * 60 * 60)
}

export function evaluateCancellation(
  now: Date,
  classStart: Date,
  policy: StudioCancellationPolicy,
): CancellationCheckResult {
  const hoursLeft = hoursUntilClass(now, classStart)

  if (hoursLeft <= 0) {
    return {
      ok: false,
      message: "No se puede cancelar: la clase ya comenzó o ya pasó.",
    }
  }

  if (hoursLeft >= policy.cancelHours) {
    return { ok: true, restoreClass: true, late: false }
  }

  if (policy.lateCancelPenalty) {
    return {
      ok: true,
      restoreClass: false,
      late: true,
    }
  }

  return { ok: true, restoreClass: true, late: true }
}

export async function loadStudioCancellationPolicy(db: AnyDb): Promise<StudioCancellationPolicy> {
  const [row] = await db
    .select({
      cancelHours: schema.studioPolicy.cancelHours,
      lateCancelPenalty: schema.studioPolicy.lateCancelPenalty,
    })
    .from(schema.studioPolicy)
    .where(eq(schema.studioPolicy.id, "main"))
    .limit(1)

  return {
    cancelHours: row?.cancelHours ?? 12,
    lateCancelPenalty: row?.lateCancelPenalty ?? true,
  }
}
