import { isAtLeastAge } from "@/lib/birthdate"
import { subscriptionCoversDate } from "@/lib/subscription-dates"

export const SENIOR_CLASS_START_TIME = "11:00"
export const SENIOR_MIN_AGE = 60

export function startOfStudioWeek(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(12, 0, 0, 0)
  const day = copy.getDay()
  const diffFromMonday = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diffFromMonday)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function isFutureBookingWeek(bookingDate: Date, now: Date = new Date()): boolean {
  return startOfStudioWeek(bookingDate).getTime() > startOfStudioWeek(now).getTime()
}

export type StudentSelfReleaseCheck =
  | { ok: true }
  | { ok: false; message: string }

export function evaluateStudentSelfRelease(params: {
  bookingDate: Date
  subscriptionStatus: string
  subscriptionStartDate: Date | string
  subscriptionEndDate: Date | number
  now?: Date
}): StudentSelfReleaseCheck {
  const now = params.now ?? new Date()

  if (!isFutureBookingWeek(params.bookingDate, now)) {
    return {
      ok: false,
      message:
        "Solo puedes liberar horarios de una semana futura. Para esta semana contacta al estudio.",
    }
  }

  if (params.subscriptionStatus !== "active") {
    return {
      ok: false,
      message: "No tienes un paquete activo para liberar este horario.",
    }
  }

  if (
    !subscriptionCoversDate(
      params.subscriptionStartDate,
      params.subscriptionEndDate,
      params.bookingDate,
    )
  ) {
    return {
      ok: false,
      message: "Tu paquete no cubre esa fecha, así que no puedes liberar el horario tú misma.",
    }
  }

  return { ok: true }
}

export function normalizeStartTime(startTime: string): string {
  const parts = startTime.trim().split(":")
  const h = parts[0]?.padStart(2, "0") ?? "00"
  const m = (parts[1] ?? "00").padStart(2, "0")
  return `${h}:${m}`
}

export function isElevenAmSlot(startTime: string): boolean {
  return normalizeStartTime(startTime) === SENIOR_CLASS_START_TIME
}

export function isSeniorOnlyElevenAmSlot(dayOfWeek: number, startTime: string): boolean {
  if (!isElevenAmSlot(startTime)) return false
  return dayOfWeek === 2 || dayOfWeek === 5
}

export function isOpenElevenAmSlot(dayOfWeek: number, startTime: string): boolean {
  if (!isElevenAmSlot(startTime)) return false
  return dayOfWeek === 6
}

export type BookingAgeCheckResult =
  | { ok: true }
  | { ok: false; message: string }

export function validateBookingAgeForSlot(
  birthdate: string | null | undefined,
  dayOfWeek: number,
  startTime: string,
  bookingDate: Date,
  classType?: string | null,
): BookingAgeCheckResult {
  if (classType === "mayores_60") {
    if (!birthdate) {
      return {
        ok: false,
        message:
          "Para esta clase especial necesitamos tu fecha de cumpleaños registrada.",
      }
    }
    if (!isAtLeastAge(birthdate, SENIOR_MIN_AGE, bookingDate)) {
      return {
        ok: false,
        message: "Esta clase es especial para personas de 60 años o más.",
      }
    }
    return { ok: true }
  }

  if (!isElevenAmSlot(startTime)) {
    return { ok: true }
  }
  if (isOpenElevenAmSlot(dayOfWeek, startTime)) {
    return { ok: true }
  }
  if (isSeniorOnlyElevenAmSlot(dayOfWeek, startTime)) {
    if (!birthdate) {
      return {
        ok: false,
        message:
          "Para la clase de las 11:00 AM (martes o viernes) necesitamos tu fecha de cumpleaños registrada.",
      }
    }
    if (!isAtLeastAge(birthdate, SENIOR_MIN_AGE, bookingDate)) {
      return {
        ok: false,
        message:
          "La clase de las 11:00 AM los martes y viernes está reservada para personas de 60 años o más.",
      }
    }
    return { ok: true }
  }
  return { ok: true }
}
