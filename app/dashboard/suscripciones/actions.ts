"use server"

import { z } from "zod"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import {
  activateSubscriptionForUser,
  cancelActiveSubscriptionsForUser,
} from "@/lib/activate-subscription"
import {
  computeSubscriptionEndDate,
  toSubscriptionLocalDate,
} from "@/lib/subscription-dates"
import { isSubscriptionRenewable } from "@/lib/subscription-display"
import { resolveCouponForPrice } from "@/lib/coupons"

export type ActionState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function setSubscriptionStatusAction(
  formData: FormData,
): Promise<ActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableRefresh: true },
  })
  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "root")
  ) {
    return { success: false, error: "No autorizado" }
  }

  const id = formData.get("id")
  const status = formData.get("status")
  if (typeof id !== "string" || typeof status !== "string") {
    return { success: false, error: "Datos inválidos" }
  }

  const db = getDb()
  await db
    .update(schema.subscription)
    .set({ status })
    .where(eq(schema.subscription.id, id))

  revalidatePath("/dashboard/suscripciones")
  revalidatePath("/dashboard/usuarios")
  return { success: true }
}

const createSubscriptionSchema = z.object({
  userId: z.string().min(1),
  planId: z.string().min(1),
  startDate: z.string().min(1),
  billingCycle: z.enum(["mensual", "quincenal", "semanal", "efectivo"]).default("mensual"),
  discountPct: z.coerce.number().min(0).max(1).optional(),
  discountReason: z
    .enum(["inauguracion", "evento_especial", "efectivo_referido"])
    .optional(),
  couponCode: z.string().optional(),
})

export async function createSubscriptionAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableRefresh: true },
  })
  if (!session || (session.user.role !== "admin" && session.user.role !== "root")) {
    return { success: false, error: "No autorizado" }
  }

  const parsed = createSubscriptionSchema.safeParse({
    userId: formData.get("userId"),
    planId: formData.get("planId"),
    startDate: formData.get("startDate"),
    billingCycle: formData.get("billingCycle") || "mensual",
    discountPct: formData.get("discountPct") || undefined,
    discountReason: formData.get("discountReason") || undefined,
    couponCode: formData.get("couponCode") || undefined,
  })
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const db = getDb()
  const startDate = new Date(parsed.data.startDate)
  const couponCode = parsed.data.couponCode?.trim() || null
  await cancelActiveSubscriptionsForUser(db, parsed.data.userId)
  const result = await activateSubscriptionForUser(db, {
    userId: parsed.data.userId,
    planId: parsed.data.planId,
    startDate,
    billingCycle: parsed.data.billingCycle,
    discountPct: couponCode ? null : (parsed.data.discountPct ?? null),
    discountReason: couponCode ? null : (parsed.data.discountReason ?? null),
    couponCode,
  })

  if (!result.ok) {
    return { success: false, error: result.error }
  }

  revalidatePath("/dashboard/suscripciones")
  revalidatePath("/dashboard/pagos")
  revalidatePath("/dashboard/usuarios")
  revalidatePath("/dashboard/cupones")
  return { success: true }
}

export async function previewCouponAction(
  couponCode: string,
  planId: string,
): Promise<{
  ok: boolean
  message?: string
  finalPrice?: number
  discountLabel?: string
  listPrice?: number
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableRefresh: true },
  })
  if (!session || (session.user.role !== "admin" && session.user.role !== "root")) {
    return { ok: false, message: "No autorizado" }
  }

  const code = couponCode.trim()
  if (code === "") {
    return { ok: false, message: "Escribe un código de cupón" }
  }
  if (planId.trim() === "") {
    return { ok: false, message: "Elige un plan primero" }
  }

  const db = getDb()
  const [plan] = await db
    .select({
      priceMxn: schema.plan.priceMxn,
      isActive: schema.plan.isActive,
    })
    .from(schema.plan)
    .where(eq(schema.plan.id, planId))
    .limit(1)

  if (plan == null || !plan.isActive) {
    return { ok: false, message: "Plan no válido" }
  }

  const resolved = await resolveCouponForPrice(db, code, plan.priceMxn)
  if (!resolved.ok) {
    return { ok: false, message: resolved.message }
  }

  return {
    ok: true,
    finalPrice: resolved.finalPrice,
    discountLabel: resolved.discountLabel,
    listPrice: plan.priceMxn,
  }
}

export async function renewSubscriptionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableRefresh: true },
  })
  if (!session || (session.user.role !== "admin" && session.user.role !== "root")) {
    return { success: false, error: "No autorizado" }
  }

  const id = formData.get("id")
  if (typeof id !== "string") {
    return { success: false, error: "ID inválido" }
  }

  const db = getDb()
  const [row] = await db
    .select({
      sub: schema.subscription,
      plan: schema.plan,
    })
    .from(schema.subscription)
    .innerJoin(schema.plan, eq(schema.subscription.planId, schema.plan.id))
    .where(eq(schema.subscription.id, id))
    .limit(1)

  if (row == null) {
    return { success: false, error: "Suscripción no encontrada" }
  }

  if (!row.plan.isActive) {
    return { success: false, error: "El plan ya no está activo" }
  }

  const end =
    row.sub.endDate instanceof Date
      ? row.sub.endDate
      : new Date(row.sub.endDate as unknown as number)
  if (!isSubscriptionRenewable(row.sub.status, end)) {
    return { success: false, error: "La suscripción aún no ha vencido" }
  }

  const plan = row.plan
  const sub = row.sub
  const startDate = toSubscriptionLocalDate(new Date())
  const endDate = computeSubscriptionEndDate(startDate, plan.durationDays)

  const discountPct = sub.discountPct
  const finalPrice =
    discountPct != null ? plan.priceMxn * (1 - discountPct) : plan.priceMxn

  const isUnlimited = plan.isUnlimited ?? false
  const classesRemaining = isUnlimited ? null : (plan.totalClasses ?? null)

  const costPerClass =
    plan.totalClasses != null && plan.totalClasses > 0
      ? finalPrice / plan.totalClasses
      : null

  await db
    .update(schema.subscription)
    .set({
      status: "active",
      startDate,
      endDate,
      classesRemaining,
      daysUsedThisWeek: 0,
      isUnlimited,
      costPerClass,
      paidAmount: finalPrice,
    })
    .where(eq(schema.subscription.id, id))

  await db.insert(schema.payment).values({
    id: crypto.randomUUID(),
    userId: sub.userId,
    subscriptionId: id,
    amount: finalPrice,
    method: sub.billingCycle === "efectivo" ? "efectivo" : "transferencia",
    status: "pending",
    concept: `Renovación: ${plan.name}${discountPct ? ` (${Math.round(discountPct * 100)}% desc.)` : ""}`,
  })

  revalidatePath("/dashboard/suscripciones")
  revalidatePath("/dashboard/pagos")
  revalidatePath("/dashboard/usuarios")
  return { success: true }
}
