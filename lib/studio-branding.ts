import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { DEFAULT_STUDIO_NAME, type StudioBranding } from "@/lib/studio-branding-constants"

export { DEFAULT_STUDIO_NAME, type StudioBranding }

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
      studioName: name !== "" ? name : DEFAULT_STUDIO_NAME,
      logoUrl: row?.logoUrl ?? null,
    }
  } catch {
    return { studioName: DEFAULT_STUDIO_NAME, logoUrl: null }
  }
}
