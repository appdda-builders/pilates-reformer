"use server"

import { z } from "zod"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { count, eq } from "drizzle-orm"

export type ActionState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

const planSchema = z
  .object({
    name: z.string().min(2),
    planType: z.enum(["class_pack", "monthly"]),
    daysPerWeek: z.coerce.number().min(0).max(7),
    totalClasses: z.preprocess((val) => {
      if (val === "" || val === null || val === undefined) return undefined
      return val
    }, z.coerce.number().min(1).optional()),
    priceMxn: z.coerce.number().min(0),
    durationDays: z.coerce.number().min(1).default(30),
  })
  .superRefine((data, ctx) => {
    if (data.priceMxn <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El precio debe ser mayor a 0",
        path: ["priceMxn"],
      })
    }
    if (data.planType === "monthly") {
      if (data.daysPerWeek < 1 || data.daysPerWeek > 7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Días por semana inválidos",
          path: ["daysPerWeek"],
        })
      }
    } else {
      const tc = data.totalClasses
      if (tc == null || Number.isNaN(tc)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Total de clases requerido",
          path: ["totalClasses"],
        })
      }
    }
  })

async function assertStaff() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableRefresh: true },
  })
  const ok =
    session != null &&
    (session.user.role === "admin" || session.user.role === "root")
  return { session, ok }
}

export async function createPlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { ok } = await assertStaff()
  if (!ok) return { success: false, error: "No autorizado" }

  const parsed = planSchema.safeParse({
    name: formData.get("name"),
    planType: formData.get("planType"),
    daysPerWeek: formData.get("daysPerWeek"),
    totalClasses: formData.get("totalClasses"),
    priceMxn: formData.get("priceMxn"),
    durationDays: formData.get("durationDays"),
  })
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const db = getDb()
  const row = {
    id: crypto.randomUUID(),
    name: parsed.data.name,
    planType: parsed.data.planType,
    priceMxn: parsed.data.priceMxn,
    durationDays: parsed.data.durationDays,
    daysPerWeek:
      parsed.data.planType === "monthly" ? parsed.data.daysPerWeek : 0,
    totalClasses:
      parsed.data.planType === "monthly"
        ? null
        : parsed.data.totalClasses ?? null,
    isActive: true,
  }
  await db.insert(schema.plan).values(row)

  revalidatePath("/dashboard/planes")
  revalidatePath("/dashboard/configuracion")
  revalidatePath("/dashboard/usuarios")
  revalidatePath("/reservaciones")
  return { success: true }
}

export async function updatePlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { ok } = await assertStaff()
  if (!ok) return { success: false, error: "No autorizado" }

  const id = formData.get("id")
  if (typeof id !== "string") return { success: false, error: "ID inválido" }

  const parsed = planSchema.safeParse({
    name: formData.get("name"),
    planType: formData.get("planType"),
    daysPerWeek: formData.get("daysPerWeek"),
    totalClasses: formData.get("totalClasses"),
    priceMxn: formData.get("priceMxn"),
    durationDays: formData.get("durationDays"),
  })
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const db = getDb()
  await db
    .update(schema.plan)
    .set({
      name: parsed.data.name,
      planType: parsed.data.planType,
      priceMxn: parsed.data.priceMxn,
      durationDays: parsed.data.durationDays,
      daysPerWeek:
        parsed.data.planType === "monthly" ? parsed.data.daysPerWeek : 0,
      totalClasses:
        parsed.data.planType === "monthly"
          ? null
          : parsed.data.totalClasses ?? null,
    })
    .where(eq(schema.plan.id, id))

  revalidatePath("/dashboard/planes")
  revalidatePath("/dashboard/configuracion")
  revalidatePath("/dashboard/usuarios")
  revalidatePath("/reservaciones")
  return { success: true }
}

export async function togglePlanAction(formData: FormData): Promise<void> {
  const { ok } = await assertStaff()
  if (!ok) return

  const id = formData.get("id")
  const isActive = formData.get("isActive") === "true"
  if (typeof id !== "string") return

  const db = getDb()
  await db.update(schema.plan).set({ isActive: !isActive }).where(eq(schema.plan.id, id))
  revalidatePath("/dashboard/planes")
  revalidatePath("/dashboard/configuracion")
  revalidatePath("/dashboard/usuarios")
  revalidatePath("/reservaciones")
}

export async function deletePlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { ok } = await assertStaff()
  if (!ok) return { success: false, error: "No autorizado" }

  const id = formData.get("id")
  if (typeof id !== "string") return { success: false, error: "ID inválido" }

  const db = getDb()
  const [{ linked }] = await db
    .select({ linked: count() })
    .from(schema.subscription)
    .where(eq(schema.subscription.planId, id))

  if (linked > 0) {
    return {
      success: false,
      error: "No se puede borrar: hay suscripciones con este plan.",
    }
  }

  try {
    await db.delete(schema.plan).where(eq(schema.plan.id, id))
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error de base de datos"
    return { success: false, error: msg }
  }

  revalidatePath("/dashboard/planes")
  revalidatePath("/dashboard/configuracion")
  revalidatePath("/dashboard/usuarios")
  revalidatePath("/reservaciones")
  return { success: true }
}
