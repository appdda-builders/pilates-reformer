"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { routes } from "@/lib/routes"

export async function cancelBooking(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const id = formData.get("id") as string
  if (!id) return { success: false, error: "ID requerido" }

  try {
    const db = getDb()
    await db.update(schema.booking)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(eq(schema.booking.id, id))
    revalidatePath(routes.reservas)
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo cancelar la reserva" }
  }
}
