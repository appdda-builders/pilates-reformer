"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { routes } from "@/lib/routes"

export async function toggleUserEnabled(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const id = formData.get("id") as string
  const enabled = formData.get("enabled") === "true"
  if (!id) return { success: false, error: "ID requerido" }

  try {
    const db = getDb()
    await db.update(schema.user).set({ enabled: !enabled }).where(eq(schema.user.id, id))
    revalidatePath(routes.usuarios)
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo actualizar el usuario" }
  }
}
