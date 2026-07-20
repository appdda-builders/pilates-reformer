import "server-only"

import { and, asc, eq, ne } from "drizzle-orm"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import {
  planRowToPublicPlan,
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
      createdAt: schema.plan.createdAt,
    })
    .from(schema.plan)
    .where(
      and(
        eq(schema.plan.isActive, true),
        eq(schema.plan.isPublic, true),
        ne(schema.plan.planType, "total_pass"),
        ne(schema.plan.id, "plan-total-pass"),
      ),
    )
    .orderBy(asc(schema.plan.createdAt))

  const sorted = sortPublicPlans(rows)
  return sorted.map(planRowToPublicPlan)
}
