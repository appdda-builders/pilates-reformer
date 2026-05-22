"use server"

import { z } from "zod"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export type ActionState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

const createPaymentSchema = z.object({
  userId: z.string().min(1),
  amount: z.coerce.number().positive(),
  method: z.enum(["efectivo", "transferencia", "terminal", "mensual", "semestral"]),
  concept: z.string().optional(),
  subscriptionId: z.string().optional(),
})

export async function createPaymentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableRefresh: true },
  })
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "No autorizado" }
  }

  const parsed = createPaymentSchema.safeParse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    method: formData.get("method"),
    concept: formData.get("concept") || undefined,
    subscriptionId: formData.get("subscriptionId") || undefined,
  })
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const db = getDb()
  await db.insert(schema.payment).values({
    id: crypto.randomUUID(),
    userId: parsed.data.userId,
    amount: parsed.data.amount,
    method: parsed.data.method,
    status: "succeeded",
    concept: parsed.data.concept ?? null,
    subscriptionId: parsed.data.subscriptionId ?? null,
  })

  revalidatePath("/dashboard/pagos")
  return { success: true }
}
