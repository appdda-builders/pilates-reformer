export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { sortPlansByDisplayOrder } from "@/lib/site/plans"
import { PlanesFormsClient } from "./planes-forms"

export default async function PlanesPage() {
  const db = getDb()
  const planes = await db.select().from(schema.plan).orderBy(schema.plan.createdAt)

  const rows = sortPlansByDisplayOrder(
    planes.map((p) => ({
      id: p.id,
      name: p.name,
      planType: p.planType,
      daysPerWeek: p.daysPerWeek,
      totalClasses: p.totalClasses,
      priceMxn: p.priceMxn,
      durationDays: p.durationDays,
      isActive: p.isActive,
    })),
  )

  return <PlanesFormsClient planes={rows} />
}
