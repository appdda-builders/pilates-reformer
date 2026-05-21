"use server"

import { revalidatePath } from "next/cache"
import { routes } from "@/lib/routes"

export async function calendarPlaceholderAction(): Promise<{ success: boolean }> {
  revalidatePath(routes.calendario)
  return { success: true }
}
