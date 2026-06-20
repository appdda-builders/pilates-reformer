import { or, eq, type SQL } from "drizzle-orm"
import { scheduleSlot } from "@/lib/db/schema"
import { coachTeachesSlot, type SlotInstructorFields } from "@/lib/schedule-instructor"

export const COACH_PARTNER_VIEWER_EMAIL = "elena.morales@demo.pilates.mx"
export const COACH_PARTNER_VIEWER_NAME = "Elena Morales"
export const COACH_PARTNER_NAME = "Lucía Paredes"

export type CoachSessionInfo = {
  role: string
  email: string
  name: string
}

export function getCoachSessionInfo(user: {
  role?: string | null
  email?: string | null
  name?: string | null
} | undefined): CoachSessionInfo | null {
  if (user == null) return null
  const role = typeof user.role === "string" ? user.role : ""
  if (role !== "coach") return null
  const email = typeof user.email === "string" ? user.email.trim().toLowerCase() : ""
  const name = typeof user.name === "string" ? user.name.trim() : ""
  if (email.length === 0 || name.length === 0) return null
  return { role, email, name }
}

export function coachViewsPartnerSchedules(email: string): boolean {
  return email.toLowerCase() === COACH_PARTNER_VIEWER_EMAIL
}

export function slotVisibleToCoach(slot: SlotInstructorFields, coach: CoachSessionInfo): boolean {
  if (coachTeachesSlot(slot, coach.name)) return true
  if (coachViewsPartnerSchedules(coach.email) && coachTeachesSlot(slot, COACH_PARTNER_NAME)) {
    return true
  }
  return false
}

export function filterSlotsForCoach<T extends SlotInstructorFields>(
  slots: T[],
  coach: CoachSessionInfo | null,
): T[] {
  if (coach == null) return slots
  return slots.filter((slot) => slotVisibleToCoach(slot, coach))
}

type ScheduleSlotCoachColumns = Pick<
  typeof scheduleSlot,
  "instructor" | "alternateInstructor"
>

export function coachScheduleSlotSql(
  table: ScheduleSlotCoachColumns,
  coach: CoachSessionInfo,
): SQL {
  if (coachViewsPartnerSchedules(coach.email)) {
    return or(
      eq(table.instructor, COACH_PARTNER_VIEWER_NAME),
      eq(table.alternateInstructor, COACH_PARTNER_VIEWER_NAME),
      eq(table.instructor, COACH_PARTNER_NAME),
      eq(table.alternateInstructor, COACH_PARTNER_NAME),
    )!
  }
  return or(eq(table.instructor, coach.name), eq(table.alternateInstructor, coach.name))!
}
