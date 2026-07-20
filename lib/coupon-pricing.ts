export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase()
}

export function priceAfterCoupon(
  priceMxn: number,
  discountType: string,
  discountValue: number,
): number {
  if (discountType === "fixed") {
    const next = priceMxn - discountValue
    return Math.max(0, Math.round(next * 100) / 100)
  }
  const pct = discountValue / 100
  return Math.max(0, Math.round(priceMxn * (1 - pct) * 100) / 100)
}

export function couponDiscountLabel(discountType: string, discountValue: number): string {
  if (discountType === "fixed") {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(discountValue)
  }
  return `${discountValue}%`
}
