"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { routes } from "@/lib/routes"

export async function createPlan(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = formData.get("name") as string
  const priceMxn = Number(formData.get("priceMxn"))
  if (!name || isNaN(priceMxn)) return { success: false, error: "Datos inválidos" }

  try {
    const db = getDb()
    await db.insert(schema.plan).values({
      id: crypto.randomUUID(),
      name,
      priceMxn,
      durationDays: Number(formData.get("durationDays") ?? 30),
    })
    revalidatePath(routes.planes)
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo crear el plan" }
  }
}
