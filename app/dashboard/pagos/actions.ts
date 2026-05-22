"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { routes } from "@/lib/routes"

export async function registerPayment(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const userId = formData.get("userId") as string
  const amount = Number(formData.get("amount"))
  const method = (formData.get("method") as string) ?? "efectivo"
  if (!userId || isNaN(amount)) return { success: false, error: "Datos inválidos" }

  try {
    const db = getDb()
    await db.insert(schema.payment).values({
      id: crypto.randomUUID(),
      userId,
      amount,
      method,
      concept: formData.get("concept") as string | null,
    })
    revalidatePath(routes.pagos)
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo registrar el pago" }
  }
}
