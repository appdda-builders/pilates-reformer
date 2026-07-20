import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { subscriptionEndOfDay, toSubscriptionLocalDate } from "@/lib/subscription-dates"
import {
  couponDiscountLabel,
  normalizeCouponCode,
  priceAfterCoupon,
} from "@/lib/coupon-pricing"

export type CouponRow = {
  id: string
  code: string
  name: string
  discountType: string
  discountValue: number
  maxUses: number | null
  usedCount: number
  validFrom: Date | null
  validUntil: Date | null
  isActive: boolean
}

export type CouponResolveResult =
  | {
      ok: true
      coupon: CouponRow
      finalPrice: number
      discountPct: number | null
      discountReason: string
      discountLabel: string
    }
  | { ok: false; message: string }

export { normalizeCouponCode, priceAfterCoupon, couponDiscountLabel }

function toDateOrNull(value: Date | number | null | undefined): Date | null {
  if (value == null) return null
  if (value instanceof Date) return value
  return new Date(value)
}

export async function findCouponByCode(
  db: AnyDb,
  codeRaw: string,
): Promise<CouponRow | null> {
  const code = normalizeCouponCode(codeRaw)
  if (code === "") return null

  const [row] = await db
    .select({
      id: schema.coupon.id,
      code: schema.coupon.code,
      name: schema.coupon.name,
      discountType: schema.coupon.discountType,
      discountValue: schema.coupon.discountValue,
      maxUses: schema.coupon.maxUses,
      usedCount: schema.coupon.usedCount,
      validFrom: schema.coupon.validFrom,
      validUntil: schema.coupon.validUntil,
      isActive: schema.coupon.isActive,
    })
    .from(schema.coupon)
    .where(eq(schema.coupon.code, code))
    .limit(1)

  if (row == null) return null

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    discountType: row.discountType,
    discountValue: row.discountValue,
    maxUses: row.maxUses,
    usedCount: row.usedCount,
    validFrom: toDateOrNull(row.validFrom as Date | number | null),
    validUntil: toDateOrNull(row.validUntil as Date | number | null),
    isActive: row.isActive,
  }
}

export function evaluateCouponForPrice(
  coupon: CouponRow,
  priceMxn: number,
  now: Date = new Date(),
): CouponResolveResult {
  if (!coupon.isActive) {
    return { ok: false, message: "Este cupón no está activo" }
  }

  if (coupon.validFrom != null) {
    const from = toSubscriptionLocalDate(coupon.validFrom)
    if (now.getTime() < from.getTime()) {
      return { ok: false, message: "Este cupón aún no es válido" }
    }
  }

  if (coupon.validUntil != null) {
    const until = subscriptionEndOfDay(coupon.validUntil)
    if (now.getTime() > until.getTime()) {
      return { ok: false, message: "Este cupón ya venció" }
    }
  }

  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, message: "Este cupón ya alcanzó el máximo de usos" }
  }

  if (coupon.discountType !== "percent" && coupon.discountType !== "fixed") {
    return { ok: false, message: "Tipo de descuento de cupón inválido" }
  }

  if (coupon.discountType === "percent") {
    if (coupon.discountValue <= 0 || coupon.discountValue > 100) {
      return { ok: false, message: "El porcentaje del cupón no es válido" }
    }
  } else if (coupon.discountValue <= 0) {
    return { ok: false, message: "El monto del cupón no es válido" }
  }

  const finalPrice = priceAfterCoupon(priceMxn, coupon.discountType, coupon.discountValue)
  const discountPct =
    coupon.discountType === "percent" ? coupon.discountValue / 100 : null
  const discountLabel = couponDiscountLabel(coupon.discountType, coupon.discountValue)

  return {
    ok: true,
    coupon,
    finalPrice,
    discountPct,
    discountReason: `cupon:${coupon.code}`,
    discountLabel,
  }
}

export async function resolveCouponForPrice(
  db: AnyDb,
  codeRaw: string,
  priceMxn: number,
  now: Date = new Date(),
): Promise<CouponResolveResult> {
  const coupon = await findCouponByCode(db, codeRaw)
  if (coupon == null) {
    return { ok: false, message: "Cupón no encontrado" }
  }
  return evaluateCouponForPrice(coupon, priceMxn, now)
}

export async function incrementCouponUsedCount(db: AnyDb, couponId: string): Promise<void> {
  const [row] = await db
    .select({ usedCount: schema.coupon.usedCount })
    .from(schema.coupon)
    .where(eq(schema.coupon.id, couponId))
    .limit(1)

  if (row == null) return

  await db
    .update(schema.coupon)
    .set({ usedCount: (row.usedCount ?? 0) + 1 })
    .where(eq(schema.coupon.id, couponId))
}
