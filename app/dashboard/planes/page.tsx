export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { sortPlansByDisplayOrder } from "@/lib/site/plans"
import { PlanesFormsClient } from "./planes-forms"

export default async function PlanesPage() {
  const db = getDb()
  const planes = await db
    .select()
    .from(schema.plan)
    .where(eq(schema.plan.isActive, true))
    .orderBy(schema.plan.createdAt)

  const rows = sortPlansByDisplayOrder(
    planes
      .filter((p) => p.planType !== "total_pass" && p.id !== "plan-total-pass")
      .map((p) => ({
      id: p.id,
      name: p.name,
      planType: p.planType,
      daysPerWeek: p.daysPerWeek,
      totalClasses: p.totalClasses,
      priceMxn: p.priceMxn,
      durationDays: p.durationDays,
      isActive: p.isActive,
      isPublic: p.isPublic,
    })),
  )

  return <PlanesFormsClient planes={rows} />
}
