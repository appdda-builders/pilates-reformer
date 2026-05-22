"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { routes } from "@/lib/routes"

export async function updateStudioPolicy(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb()
    const studioName = formData.get("studioName") as string | null
    const maxCapacity = Number(formData.get("maxCapacity") ?? 8)
    const cancelHours = Number(formData.get("cancelHours") ?? 12)

    const [existing] = await db.select({ id: schema.studioPolicy.id }).from(schema.studioPolicy).limit(1)

    if (existing) {
      await db.update(schema.studioPolicy)
        .set({ studioName: studioName ?? "Pilates Studio", maxCapacity, cancelHours })
        .where(eq(schema.studioPolicy.id, existing.id))
    } else {
      await db.insert(schema.studioPolicy).values({
        studioName: studioName ?? "Pilates Studio",
        maxCapacity,
        cancelHours,
      })
    }

    revalidatePath(routes.configuracion)
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo guardar la configuración" }
  }
}
