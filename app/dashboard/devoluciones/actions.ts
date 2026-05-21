"use server"

import { revalidatePath } from "next/cache"
import { routes } from "@/lib/routes"

export async function devolucionPlaceholderAction(): Promise<{ success: boolean }> {
  revalidatePath(routes.devoluciones)
  return { success: true }
}
