import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function revokeUserSessions(db: AnyDb, userId: string) {
  await db.delete(schema.session).where(eq(schema.session.userId, userId))
}
