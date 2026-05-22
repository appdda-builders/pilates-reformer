"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { routes } from "@/lib/routes"

export async function toggleSlotActive(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const id = formData.get("id") as string
  const isActive = formData.get("isActive") === "true"
  if (!id) return { success: false, error: "ID requerido" }

  try {
    const db = getDb()
    await db.update(schema.scheduleSlot).set({ isActive: !isActive }).where(eq(schema.scheduleSlot.id, id))
    revalidatePath(routes.clases)
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo actualizar la clase" }
  }
}
