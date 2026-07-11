"use server"

import { z } from "zod"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { asc, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import {
  createBookingForUser,
  userHasBookingForSlot,
  checkBookableSubscriptionForUser,
  checkSlotCapacityForBooking,
} from "@/lib/booking-service"
import { validateBookingAgeForSlot } from "@/lib/booking-rules"
import { classEndFromBooking, evaluateBookingAllowed } from "@/lib/cancellation-policy"
import {
  type BookingSlotOption,
  localTodayStr,
  resolveBookingDefaultDate,
} from "@/lib/booking-slot-options"
import {
  sendStudioPaymentNotification,
  sendTransferPaymentNotification,
} from "@/lib/payment-notifications"
import { isSlotDisabledOnDate } from "@/lib/slot-exceptions"

export type PublicBookingState = {
  success: boolean
  error?: string
  message?: string
  bookedDate?: string
}

export type AgendarData = {
  slots: BookingSlotOption[]
  defaultDate: string
  todayStr: string
}

const publicBookingSchema = z.object({
  scheduleSlotId: z.string().min(1),
  bookingDate: z.string().min(1),
  paymentMethod: z.enum(["efectivo", "transferencia"]).optional(),
})

type SessionAlumna =
  | {
      ok: true
      alumna: {
        id: string
        name: string
        birthdate: string | null
        role: string | null
        enabled: boolean | null
        displayId: string | null
      }
    }
  | { ok: false; error: string }

async function getSessionAlumna(): Promise<SessionAlumna> {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableRefresh: true },
  })
  if (session == null) {
    return { ok: false, error: "Debes iniciar sesión para reservar" }
  }

  const db = getDb()
  const [alumna] = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      birthdate: schema.user.birthdate,
      role: schema.user.role,
      enabled: schema.user.enabled,
      displayId: schema.user.displayId,
    })
    .from(schema.user)
    .where(eq(schema.user.id, session.user.id))
    .limit(1)

  if (alumna == null) {
    return { ok: false, error: "Usuario no encontrado" }
  }
  if (alumna.enabled === false) {
    return { ok: false, error: "Tu cuenta está inhabilitada. Contacta al estudio." }
  }
  if (alumna.role !== "alumno") {
    return { ok: false, error: "Esta cuenta no puede reservar clases desde aquí" }
  }
  if (alumna.displayId == null || alumna.displayId.trim() === "") {
    return { ok: false, error: "Tu cuenta aún no está activa. Contacta al estudio." }
  }

  return { ok: true, alumna }
}

export async function loadAgendarDataAction(): Promise<AgendarData> {
  const db = getDb()
  const rows = await db
    .select({
      id: schema.scheduleSlot.id,
      dayOfWeek: schema.scheduleSlot.dayOfWeek,
      startTime: schema.scheduleSlot.startTime,
      endTime: schema.scheduleSlot.endTime,
      className: schema.scheduleSlot.className,
      instructor: schema.scheduleSlot.instructor,
    })
    .from(schema.scheduleSlot)
    .where(eq(schema.scheduleSlot.isActive, true))
    .orderBy(asc(schema.scheduleSlot.dayOfWeek), asc(schema.scheduleSlot.startTime))

  const slots: BookingSlotOption[] = rows.map((row) => ({
    id: row.id,
    dayOfWeek: row.dayOfWeek,
    startTime: row.startTime,
    endTime: row.endTime,
    className: row.className,
    instructor: row.instructor,
  }))

  const todayStr = localTodayStr()
  const defaultDate = resolveBookingDefaultDate(todayStr, slots)

  return { slots, defaultDate, todayStr }
}

export async function createPublicBookingAction(
  _prev: PublicBookingState,
  formData: FormData,
): Promise<PublicBookingState> {
  const sessionAlumna = await getSessionAlumna()
  if (!sessionAlumna.ok) {
    return { success: false, error: sessionAlumna.error }
  }

  const parsed = publicBookingSchema.safeParse({
    scheduleSlotId: formData.get("scheduleSlotId"),
    bookingDate: formData.get("bookingDate"),
    paymentMethod: formData.get("paymentMethod") || undefined,
  })
  if (!parsed.success) {
    return { success: false, error: "Revisa la fecha y el horario" }
  }

  const db = getDb()
  const alumna = sessionAlumna.alumna
  const allowNoClasses = parsed.data.paymentMethod === "efectivo"
  const subCheck = await checkBookableSubscriptionForUser(db, alumna.id)
  if (!subCheck.ok && !(allowNoClasses && subCheck.reason === "no_classes")) {
    return { success: false, error: subCheck.message }
  }

  const bookingDate = new Date(`${parsed.data.bookingDate}T12:00:00`)
  const result = await createBookingForUser(db, {
    userId: alumna.id,
    scheduleSlotId: parsed.data.scheduleSlotId,
    bookingDate,
    birthdate: alumna.birthdate,
    allowNoClasses,
  })

  if (!result.ok) {
    return { success: false, error: result.message }
  }

  revalidatePath("/dashboard/reservas")

  return {
    success: true,
    message: `${result.userName}, tu clase quedó confirmada.`,
    bookedDate: parsed.data.bookingDate,
  }
}

export async function sendBookingPaymentNotificationAction(
  method: "efectivo" | "transferencia",
): Promise<{ ok: boolean; error?: string }> {
  const sessionAlumna = await getSessionAlumna()
  if (!sessionAlumna.ok) {
    return { ok: false, error: sessionAlumna.error }
  }

  const db = getDb()
  const alumna = sessionAlumna.alumna
  const subCheck = await checkBookableSubscriptionForUser(db, alumna.id)
  if (subCheck.ok) {
    return { ok: false, error: "Aún tienes clases disponibles en tu plan." }
  }
  if (subCheck.reason !== "no_classes") {
    return { ok: false, error: subCheck.message }
  }

  if (method === "efectivo") {
    await sendStudioPaymentNotification(db, {
      userId: alumna.id,
      nombre: alumna.name,
    })
    return { ok: true }
  }

  await sendTransferPaymentNotification(db, {
    userId: alumna.id,
    nombre: alumna.name,
  })

  return { ok: true }
}

export async function checkPublicBookingEligibility(
  scheduleSlotId: string,
  bookingDateStr: string,
): Promise<{ ok: boolean; message?: string; alumnaName?: string; noClasses?: boolean }> {
  const sessionAlumna = await getSessionAlumna()
  if (!sessionAlumna.ok) {
    return { ok: false, message: sessionAlumna.error }
  }

  const alumna = sessionAlumna.alumna
  const db = getDb()

  const [slot] = await db
    .select({
      dayOfWeek: schema.scheduleSlot.dayOfWeek,
      startTime: schema.scheduleSlot.startTime,
      endTime: schema.scheduleSlot.endTime,
      className: schema.scheduleSlot.className,
      classType: schema.scheduleSlot.classType,
    })
    .from(schema.scheduleSlot)
    .where(eq(schema.scheduleSlot.id, scheduleSlotId))
    .limit(1)

  if (!slot) {
    return { ok: false, message: "Horario no válido" }
  }

  const bookingDate = new Date(`${bookingDateStr}T12:00:00`)
  const disabledThisDate = await isSlotDisabledOnDate(db, scheduleSlotId, bookingDateStr)
  if (disabledThisDate) {
    return { ok: false, message: "Esta clase no se imparte esa semana." }
  }

  const check = validateBookingAgeForSlot(
    alumna.birthdate,
    slot.dayOfWeek,
    slot.startTime,
    bookingDate,
    slot.classType,
  )
  if (!check.ok) {
    return { ok: false, message: check.message }
  }

  const alreadyBooked = await userHasBookingForSlot(
    db,
    alumna.id,
    scheduleSlotId,
    bookingDate,
  )
  if (alreadyBooked) {
    return {
      ok: false,
      message: "Ya tienes una reserva confirmada para esa clase en esa fecha",
    }
  }

  const capacityCheck = await checkSlotCapacityForBooking(db, scheduleSlotId, bookingDate)
  if (!capacityCheck.ok) {
    return { ok: false, message: capacityCheck.message }
  }

  const classEnd = classEndFromBooking(bookingDate, slot.startTime, slot.endTime)
  const timingCheck = evaluateBookingAllowed(new Date(), classEnd)
  if (!timingCheck.ok) {
    return { ok: false, message: timingCheck.message }
  }

  const subCheck = await checkBookableSubscriptionForUser(db, alumna.id)
  if (!subCheck.ok) {
    return {
      ok: false,
      message: subCheck.message,
      noClasses: subCheck.reason === "no_classes",
    }
  }

  return { ok: true, alumnaName: alumna.name }
}
