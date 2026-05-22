import { sql, type SQL } from "drizzle-orm"
import type { AnyColumn } from "drizzle-orm"
import { shouldUseSqlite } from "@/lib/db/runtime-driver"

export const STUDIO_TIMEZONE = "America/Mexico_City"

export function studioYearMonth(reference = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDIO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(reference)
  const y = parts.find((p) => p.type === "year")?.value ?? "1970"
  const m = parts.find((p) => p.type === "month")?.value ?? "01"
  return `${y}-${m}`
}

export function studioMonthLabel(reference = new Date()): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: STUDIO_TIMEZONE,
    month: "long",
    year: "numeric",
  }).format(reference)
}

export function paymentCreatedInStudioMonth(
  createdAtColumn: AnyColumn | SQL,
  reference = new Date(),
): SQL {
  const ym = studioYearMonth(reference)
  if (!shouldUseSqlite()) {
    return sql`to_char(${createdAtColumn}::date, 'YYYY-MM') = ${ym}`
  }
  return sql`strftime('%Y-%m', ${createdAtColumn}) = ${ym}`
}
