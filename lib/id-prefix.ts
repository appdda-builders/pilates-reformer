import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const USER_ID_PREFIX_REGULAR = "ST"
export const USER_ID_PREFIX_TOTAL_PASS = "STT"

export type UserIdPrefix =
  | typeof USER_ID_PREFIX_REGULAR
  | typeof USER_ID_PREFIX_TOTAL_PASS

export function parseUserIdPrefix(raw: unknown): UserIdPrefix {
  if (
    typeof raw === "string" &&
    raw.trim().toUpperCase() === USER_ID_PREFIX_TOTAL_PASS
  ) {
    return USER_ID_PREFIX_TOTAL_PASS
  }
  return USER_ID_PREFIX_REGULAR
}

export async function resolveIdPrefixForPlanId(
  db: AnyDb,
  planId: string,
): Promise<UserIdPrefix> {
  const trimmed = planId.trim()
  if (trimmed === "") {
    return USER_ID_PREFIX_REGULAR
  }

  const [plan] = await db
    .select({ planType: schema.plan.planType })
    .from(schema.plan)
    .where(eq(schema.plan.id, trimmed))
    .limit(1)

  if (plan?.planType === "total_pass") {
    return USER_ID_PREFIX_TOTAL_PASS
  }
  return USER_ID_PREFIX_REGULAR
}
