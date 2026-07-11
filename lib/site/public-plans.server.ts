import "server-only"

import { and, eq, inArray } from "drizzle-orm"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import {
  planRowToPublicPlan,
  PUBLIC_RESERVACIONES_PLAN_IDS,
  sortPublicPlans,
  type PublicPlan,
} from "@/lib/site/plans"

export async function loadReservacionesPlans(): Promise<PublicPlan[]> {
  const db = getDb()
  const rows = await db
    .select({
      id: schema.plan.id,
      name: schema.plan.name,
      planType: schema.plan.planType,
      totalClasses: schema.plan.totalClasses,
      durationDays: schema.plan.durationDays,
      priceMxn: schema.plan.priceMxn,
      isUnlimited: schema.plan.isUnlimited,
    })
    .from(schema.plan)
    .where(
      and(
        eq(schema.plan.isActive, true),
        inArray(schema.plan.id, [...PUBLIC_RESERVACIONES_PLAN_IDS]),
      ),
    )

  const visible = rows.filter(
    (row) => row.planType !== "total_pass" && row.id !== "plan-total-pass",
  )
  const sorted = sortPublicPlans(visible)
  return sorted.map(planRowToPublicPlan)
}
