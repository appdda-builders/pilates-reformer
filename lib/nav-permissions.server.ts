import "server-only"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import {
  getDefaultNavPermissions,
  parseNavPermissionsJson,
  type NavPermissionsMap,
} from "@/lib/nav-permissions"

export async function loadNavPermissions(): Promise<NavPermissionsMap> {
  try {
    const db = getDb()
    const [policy] = await db
      .select({ navPermissions: schema.studioPolicy.navPermissions })
      .from(schema.studioPolicy)
      .where(eq(schema.studioPolicy.id, "main"))
      .limit(1)
    return parseNavPermissionsJson(policy?.navPermissions ?? null)
  } catch {
    return getDefaultNavPermissions()
  }
}
