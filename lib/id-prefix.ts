import type { AnyDb } from "@/lib/db"

export const USER_ID_PREFIX_REGULAR = "ST"

export type UserIdPrefix = typeof USER_ID_PREFIX_REGULAR

export function parseUserIdPrefix(_raw: unknown): UserIdPrefix {
  return USER_ID_PREFIX_REGULAR
}

export async function resolveIdPrefixForPlanId(
  _db: AnyDb,
  _planId: string,
): Promise<UserIdPrefix> {
  return USER_ID_PREFIX_REGULAR
}
