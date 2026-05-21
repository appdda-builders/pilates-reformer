"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { routes } from "@/lib/routes"

export async function cancelSubscription(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const id = formData.get("id") as string
  if (!id) return { success: false, error: "ID requerido" }

  try {
    const db = getDb()
    await db.update(schema.subscription).set({ status: "cancelled" }).where(eq(schema.subscription.id, id))
    revalidatePath(routes.suscripciones)
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo cancelar" }
  }
}
