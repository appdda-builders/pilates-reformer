import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export type StudioBranding = {
  studioName: string
  logoUrl: string | null
}

export async function getStudioBranding(): Promise<StudioBranding> {
  try {
    const db = getDb()
    const rows = await db
      .select({
        studioName: schema.studioPolicy.studioName,
        logoUrl: schema.studioPolicy.logoUrl,
      })
      .from(schema.studioPolicy)
      .limit(1)

    const row = rows[0]
    const name = row?.studioName?.trim() ?? ""
    return {
      studioName: name !== "" ? name : "Pilates Studio",
      logoUrl: row?.logoUrl ?? null,
    }
  } catch {
    return { studioName: "Pilates Studio", logoUrl: null }
  }
}
