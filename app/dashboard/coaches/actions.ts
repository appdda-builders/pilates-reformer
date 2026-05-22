"use server"

import { revalidatePath } from "next/cache"
import { routes } from "@/lib/routes"

export async function coachPlaceholderAction(): Promise<{ success: boolean }> {
  revalidatePath(routes.coaches)
  return { success: true }
}
