import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export type UserIdPrefix = "ZA" | "ZAT"

export function parseUserIdPrefix(raw: unknown): UserIdPrefix {
  if (typeof raw === "string" && raw.trim().toUpperCase() === "ZAT") {
    return "ZAT"
  }
  return "ZA"
}

export async function resolveIdPrefixForPlanId(
  db: AnyDb,
  planId: string,
): Promise<UserIdPrefix> {
  const trimmed = planId.trim()
  if (trimmed === "") {
    return "ZA"
  }

  const [plan] = await db
    .select({ planType: schema.plan.planType })
    .from(schema.plan)
    .where(eq(schema.plan.id, trimmed))
    .limit(1)

  if (plan?.planType === "total_pass") {
    return "ZAT"
  }
  return "ZA"
}
