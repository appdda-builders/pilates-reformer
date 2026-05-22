import "server-only"

import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { and, eq, gte, lt } from "drizzle-orm"
import { birthdateMonthDayKey } from "@/lib/birthdate"
import { interpolateMessage } from "@/lib/messages"
import { createNotification } from "@/lib/notifications"

function todayMonthDayKey(date: Date = new Date()): string {
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

export function isBirthdayToday(birthdate: string | null | undefined): boolean {
  if (birthdate == null || birthdate.trim() === "") return false
  const key = birthdateMonthDayKey(birthdate)
  if (key == null) return false
  return key === todayMonthDayKey()
}

export function isBirthdayWithinNextDays(
  birthdate: string | null | undefined,
  days: number,
): boolean {
  if (birthdate == null || birthdate.trim() === "") return false
  const key = birthdateMonthDayKey(birthdate)
  if (key == null) return false
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  for (let i = 1; i <= days; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (todayMonthDayKey(d) === key) return true
  }
  return false
}

export async function sendTodayBirthdayNotifications(db: AnyDb): Promise<number> {
  const todayKey = todayMonthDayKey()
  const { start, end } = todayRange()

  const [policy] = await db
    .select({
      birthdayMessage: schema.studioPolicy.birthdayMessage,
      studioName: schema.studioPolicy.studioName,
    })
    .from(schema.studioPolicy)
    .where(eq(schema.studioPolicy.id, "main"))
    .limit(1)

  const template =
    policy?.birthdayMessage?.trim() ??
    "¡Feliz cumpleaños {{nombre}}! El equipo de {{estudio}} te desea un día increíble."
  const estudio = policy?.studioName?.trim() ?? "Zenda Abuné"

  const alumnos = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      birthdate: schema.user.birthdate,
    })
    .from(schema.user)
    .where(eq(schema.user.role, "alumno"))

  let sent = 0

  for (const alumno of alumnos) {
    if (typeof alumno.birthdate !== "string") continue
    const md = birthdateMonthDayKey(alumno.birthdate)
    if (md == null || md !== todayKey) continue

    const [already] = await db
      .select({ id: schema.notification.id })
      .from(schema.notification)
      .where(
        and(
          eq(schema.notification.userId, alumno.id),
          eq(schema.notification.type, "birthday"),
          gte(schema.notification.createdAt, start),
          lt(schema.notification.createdAt, end),
        ),
      )
      .limit(1)

    if (already != null) continue

    const body = interpolateMessage(template, {
      nombre: alumno.name,
      estudio,
      fecha: new Date().toLocaleDateString("es-MX"),
    })

    await createNotification(db, {
      userId: alumno.id,
      type: "birthday",
      title: "¡Feliz cumpleaños!",
      body,
    })
    sent++
  }

  return sent
}
