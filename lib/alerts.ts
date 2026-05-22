import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq, lte, and, gte, lt } from "drizzle-orm"

export async function getExpiringSubscriptions(db: AnyDb, daysThreshold: number) {
  const now = new Date()
  const threshold = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000)

  return db
    .select({
      userId: schema.subscription.userId,
      endDate: schema.subscription.endDate,
      classesRemaining: schema.subscription.classesRemaining,
      userName: schema.user.name,
      userEmail: schema.user.email,
      planName: schema.plan.name,
    })
    .from(schema.subscription)
    .innerJoin(schema.user, eq(schema.subscription.userId, schema.user.id))
    .innerJoin(schema.plan, eq(schema.subscription.planId, schema.plan.id))
    .where(
      and(
        eq(schema.subscription.status, "active"),
        lte(schema.subscription.endDate, threshold),
        gte(schema.subscription.endDate, now),
      ),
    )
}

export async function getLowClassAlumnos(db: AnyDb, threshold: number) {
  return db
    .select({
      userId: schema.subscription.userId,
      classesRemaining: schema.subscription.classesRemaining,
      userName: schema.user.name,
      userEmail: schema.user.email,
      planName: schema.plan.name,
    })
    .from(schema.subscription)
    .innerJoin(schema.user, eq(schema.subscription.userId, schema.user.id))
    .innerJoin(schema.plan, eq(schema.subscription.planId, schema.plan.id))
    .where(
      and(
        eq(schema.subscription.status, "active"),
        lte(schema.subscription.classesRemaining, threshold),
      ),
    )
}

export async function getBirthdayAlumnos(db: AnyDb) {
  const today = new Date()
  const todayMD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const in7MD = `${String(in7Days.getMonth() + 1).padStart(2, "0")}-${String(in7Days.getDate()).padStart(2, "0")}`

  const alumnos = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      birthdate: schema.user.birthdate,
    })
    .from(schema.user)
    .where(eq(schema.user.role, "alumno"))

  return alumnos.filter((a) => {
    if (!a.birthdate) return false
    const md = a.birthdate.slice(5) // "MM-DD" from "YYYY-MM-DD"
    return md >= todayMD && md <= in7MD
  })
}
