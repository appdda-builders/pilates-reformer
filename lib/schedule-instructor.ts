export type SlotInstructorFields = {
  instructor: string | null
  alternateInstructor?: string | null
  scheduleMode?: string | null
}

export function isDualCoachSlot(slot: SlotInstructorFields): boolean {
  if (slot.scheduleMode !== "dual" && slot.scheduleMode !== "alternating_weekly") {
    return false
  }
  return (
    slot.instructor != null &&
    slot.instructor.length > 0 &&
    slot.alternateInstructor != null &&
    slot.alternateInstructor.length > 0
  )
}

export function formatSlotInstructorLabel(slot: SlotInstructorFields): string {
  if (!isDualCoachSlot(slot)) {
    return slot.instructor ?? "Sin instructor asignado"
  }
  return `${slot.instructor} · ${slot.alternateInstructor}`
}

export function resolveSlotInstructor(slot: SlotInstructorFields): string | null {
  return slot.instructor ?? null
}

export function coachTeachesSlot(slot: SlotInstructorFields, coachName: string): boolean {
  const name = coachName.trim()
  if (name.length === 0) return false
  if (slot.instructor === name) return true
  if (isDualCoachSlot(slot) && slot.alternateInstructor === name) return true
  return false
}
