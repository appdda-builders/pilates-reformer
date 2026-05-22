import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { and, isNotNull, eq } from "drizzle-orm"

export async function generateDisplayId(db: AnyDb, prefix: "ZA" | "ZAT" = "ZA"): Promise<string> {
  const rows = await db
    .select({ displayId: schema.user.displayId })
    .from(schema.user)
    .where(and(isNotNull(schema.user.displayId), eq(schema.user.idPrefix, prefix)))

  let maxNum = 0
  const re = new RegExp(`^${prefix}(\\d+)$`, "i")
  for (const row of rows) {
    if (!row.displayId) continue
    const m = re.exec(row.displayId)
    if (m) {
      const num = Number.parseInt(m[1], 10)
      if (!Number.isNaN(num) && num > maxNum) maxNum = num
    }
  }

  const nextNum = maxNum + 1
  // ZA → 4 digits: ZA0001 | ZAT → 3 digits: ZAT001
  const padLen = prefix === "ZAT" ? 3 : 4
  return `${prefix}${String(nextNum).padStart(padLen, "0")}`
}
