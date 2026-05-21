"use server"

import { revalidatePath } from "next/cache"
import { routes } from "@/lib/routes"

export async function markAttendance(formData: FormData): Promise<{ success: boolean; error?: string }> {
  void formData
  revalidatePath(routes.coachAttendance)
  return { success: true }
}
