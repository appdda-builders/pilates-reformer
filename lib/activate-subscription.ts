import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import {
  computeSubscriptionEndDate,
  toSubscriptionLocalDate,
} from "@/lib/subscription-dates"

export async function activateSubscriptionForUser(
  db: AnyDb,
  params: {
    userId: string
    planId: string
    startDate?: Date
    billingCycle?: string
    discountPct?: number | null
    discountReason?: string | null
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const [selectedPlan] = await db
    .select()
    .from(schema.plan)
    .where(eq(schema.plan.id, params.planId))
    .limit(1)

  if (!selectedPlan) {
    return { ok: false, error: "Plan no encontrado" }
  }

  if (!selectedPlan.isActive) {
    return { ok: false, error: "El plan no está activo" }
  }

  const startDate = toSubscriptionLocalDate(params.startDate ?? new Date())
  const endDate = computeSubscriptionEndDate(startDate, selectedPlan.durationDays)

  const discountPct = params.discountPct ?? null
  const finalPrice =
    discountPct != null ? selectedPlan.priceMxn * (1 - discountPct) : selectedPlan.priceMxn

  const costPerClass =
    selectedPlan.totalClasses != null && selectedPlan.totalClasses > 0
      ? finalPrice / selectedPlan.totalClasses
      : null

  const isUnlimited = selectedPlan.isUnlimited ?? false
  const classesRemaining = isUnlimited ? null : (selectedPlan.totalClasses ?? null)

  const billingCycle = params.billingCycle ?? "mensual"
  const subId = crypto.randomUUID()

  await db.insert(schema.subscription).values({
    id: subId,
    userId: params.userId,
    planId: params.planId,
    status: "active",
    startDate,
    endDate,
    classesRemaining,
    daysUsedThisWeek: 0,
    isUnlimited,
    billingCycle,
    discountPct,
    discountReason: params.discountReason ?? null,
    costPerClass,
    paidAmount: finalPrice,
  })

  await db.insert(schema.payment).values({
    id: crypto.randomUUID(),
    userId: params.userId,
    subscriptionId: subId,
    amount: finalPrice,
    method: billingCycle === "efectivo" ? "efectivo" : "transferencia",
    status: "pending",
    concept: `Suscripción: ${selectedPlan.name}${discountPct ? ` (${Math.round(discountPct * 100)}% desc.)` : ""}`,
  })

  return { ok: true }
}

export async function cancelActiveSubscriptionsForUser(db: AnyDb, userId: string) {
  await db
    .update(schema.subscription)
    .set({ status: "cancelled", classesRemaining: 0 })
    .where(
      and(
        eq(schema.subscription.userId, userId),
        eq(schema.subscription.status, "active"),
      ),
    )
}

export async function applyUserPlan(
  db: AnyDb,
  params: {
    userId: string
    planId: string
    billingCycle?: string
    startDate?: Date
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const planId = params.planId.trim()

  const [active] = await db
    .select({
      id: schema.subscription.id,
      planId: schema.subscription.planId,
    })
    .from(schema.subscription)
    .where(
      and(
        eq(schema.subscription.userId, params.userId),
        eq(schema.subscription.status, "active"),
      ),
    )
    .limit(1)

  if (planId === "") {
    if (active != null) {
      await cancelActiveSubscriptionsForUser(db, params.userId)
    }
    return { ok: true }
  }

  if (active != null && active.planId === planId) {
    return { ok: true }
  }

  if (active != null) {
    await cancelActiveSubscriptionsForUser(db, params.userId)
  }

  return activateSubscriptionForUser(db, {
    userId: params.userId,
    planId,
    billingCycle: params.billingCycle,
    startDate: params.startDate,
  })
}
