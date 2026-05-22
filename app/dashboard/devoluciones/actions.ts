"use server"

import { z } from "zod"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { calculateRefund } from "@/lib/refund-logic"

export type ActionState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

const createRefundSchema = z.object({
  userId: z.string().min(1),
  subscriptionId: z.string().min(1),
  classesUsed: z.coerce.number().int().min(0),
  reason: z.string().optional(),
})

export async function createRefundAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableRefresh: true },
  })
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session || (role !== "admin" && role !== "root")) {
    return { success: false, error: "No autorizado" }
  }

  const parsed = createRefundSchema.safeParse({
    userId: formData.get("userId"),
    subscriptionId: formData.get("subscriptionId"),
    classesUsed: formData.get("classesUsed"),
    reason: formData.get("reason") || undefined,
  })
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const db = getDb()

  const [sub] = await db
    .select({
      id: schema.subscription.id,
      status: schema.subscription.status,
      isUnlimited: schema.subscription.isUnlimited,
      classesRemaining: schema.subscription.classesRemaining,
      planId: schema.subscription.planId,
    })
    .from(schema.subscription)
    .where(eq(schema.subscription.id, parsed.data.subscriptionId))
    .limit(1)

  if (!sub) return { success: false, error: "Suscripción no encontrada" }
  if (sub.status !== "active") return { success: false, error: "La suscripción no está activa" }
  if (sub.isUnlimited) return { success: false, error: "Total Pass ilimitado no aplica devolución proporcional" }

  const [p] = await db
    .select({ totalClasses: schema.plan.totalClasses, priceMxn: schema.plan.priceMxn })
    .from(schema.plan)
    .where(eq(schema.plan.id, sub.planId))
    .limit(1)

  if (!p || !p.totalClasses) {
    return { success: false, error: "No se puede calcular devolución para este plan" }
  }

  const [payment] = await db
    .select({ amount: schema.payment.amount })
    .from(schema.payment)
    .where(eq(schema.payment.subscriptionId, sub.id))
    .limit(1)

  const totalPaid = payment?.amount ?? p.priceMxn

  const { costPerClass, classesRefunded, refundAmount } = calculateRefund({
    totalPaid,
    totalClasses: p.totalClasses,
    classesUsed: parsed.data.classesUsed,
  })

  if (classesRefunded < 0) {
    return { success: false, error: "Las clases usadas superan el total del plan" }
  }

  await db.insert(schema.refund).values({
    userId: parsed.data.userId,
    subscriptionId: parsed.data.subscriptionId,
    classesTotal: p.totalClasses,
    classesUsed: parsed.data.classesUsed,
    classesRefunded,
    costPerClass,
    totalPaid,
    refundAmount,
    reason: parsed.data.reason ?? null,
    processedBy: session.user.id,
  })

  await db
    .update(schema.subscription)
    .set({ status: "cancelled", classesRemaining: 0 })
    .where(eq(schema.subscription.id, sub.id))

  revalidatePath("/dashboard/devoluciones")
  revalidatePath("/dashboard/suscripciones")
  return { success: true }
}
