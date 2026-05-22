export type StudioPlanDefinition = {
  id: string
  name: string
  planType: "class_pack" | "total_pass" | "add_on"
  totalClasses: number | null
  priceMxn: number
  durationDays: number
  isAddOn: boolean
  isUnlimited: boolean
}

export const STUDIO_PLAN_DEFINITIONS: StudioPlanDefinition[] = [
  {
    id: "plan-apertura",
    name: "Clase de Apertura",
    planType: "class_pack",
    totalClasses: 1,
    priceMxn: 0,
    durationDays: 30,
    isAddOn: false,
    isUnlimited: false,
  },
  {
    id: "plan-descubre",
    name: "Clase Descubre",
    planType: "class_pack",
    totalClasses: 1,
    priceMxn: 270,
    durationDays: 30,
    isAddOn: false,
    isUnlimited: false,
  },
  {
    id: "plan-inicia",
    name: "Inicia tu camino",
    planType: "class_pack",
    totalClasses: 4,
    priceMxn: 950,
    durationDays: 30,
    isAddOn: false,
    isUnlimited: false,
  },
  {
    id: "plan-conecta",
    name: "Conecta y Fortalece",
    planType: "class_pack",
    totalClasses: 8,
    priceMxn: 1600,
    durationDays: 30,
    isAddOn: false,
    isUnlimited: false,
  },
  {
    id: "plan-activa",
    name: "Activa tu grandeza interior",
    planType: "class_pack",
    totalClasses: 12,
    priceMxn: 2000,
    durationDays: 30,
    isAddOn: false,
    isUnlimited: false,
  },
  {
    id: "plan-reinventa",
    name: "Reinventa tu ser",
    planType: "class_pack",
    totalClasses: 20,
    priceMxn: 2700,
    durationDays: 30,
    isAddOn: false,
    isUnlimited: false,
  },
  {
    id: "plan-total-pass",
    name: "Total Pass",
    planType: "total_pass",
    totalClasses: null,
    priceMxn: 0,
    durationDays: 30,
    isAddOn: false,
    isUnlimited: true,
  },
  {
    id: "plan-privada",
    name: "Clase Privada",
    planType: "add_on",
    totalClasses: 1,
    priceMxn: 500,
    durationDays: 30,
    isAddOn: true,
    isUnlimited: false,
  },
]

export const PUBLIC_RESERVACIONES_PLAN_IDS = [
  "plan-descubre",
  "plan-inicia",
  "plan-conecta",
  "plan-activa",
  "plan-reinventa",
  "plan-total-pass",
] as const

export const PLAN_DISPLAY_ORDER = STUDIO_PLAN_DEFINITIONS.map((p) => p.id)

export type PublicPlan = {
  id: string
  name: string
  includes: string
  validity: string
  priceLabel: string
  isTotalPass: boolean
}

export type PlanLabelRow = {
  name: string
  planType: string
  priceMxn: number
}

export function formatPlanPrice(priceMxn: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(priceMxn)
}

export function formatPublicPlanPrice(planType: string, priceMxn: number): string {
  if (planType === "total_pass") return "—"
  return formatPlanPrice(priceMxn)
}

export function formatPlanPickerLabel(plan: PlanLabelRow): string {
  const price = formatPublicPlanPrice(plan.planType, plan.priceMxn)
  return `${plan.name} — ${price}`
}

export function formatPlanIncludes(
  planType: string,
  totalClasses: number | null,
  isUnlimited: boolean,
): string {
  if (planType === "total_pass" || isUnlimited) return "Acceso flexible"
  if (totalClasses === 1) return "1 clase"
  if (totalClasses != null && totalClasses > 1) return `${totalClasses} clases`
  return "—"
}

export function formatPlanValidity(durationDays: number): string {
  return `${durationDays} días`
}

export function planRowToPublicPlan(row: {
  id: string
  name: string
  planType: string
  totalClasses: number | null
  durationDays: number
  priceMxn: number
  isUnlimited: boolean
}): PublicPlan {
  const isTotalPass = row.planType === "total_pass"
  return {
    id: row.id,
    name: row.name,
    includes: formatPlanIncludes(row.planType, row.totalClasses, row.isUnlimited),
    validity: formatPlanValidity(row.durationDays),
    priceLabel: formatPublicPlanPrice(row.planType, row.priceMxn),
    isTotalPass,
  }
}

export function sortPlansByDisplayOrder<T extends { id: string }>(rows: T[]): T[] {
  const order = new Map(PLAN_DISPLAY_ORDER.map((id, index) => [id, index]))
  return [...rows].sort((a, b) => {
    const ai = order.get(a.id)
    const bi = order.get(b.id)
    if (ai != null && bi != null) return ai - bi
    if (ai != null) return -1
    if (bi != null) return 1
    return a.id.localeCompare(b.id)
  })
}

export function sortPublicPlans<T extends { id: string }>(rows: T[]): T[] {
  const order = new Map(PUBLIC_RESERVACIONES_PLAN_IDS.map((id, index) => [id, index]))
  return [...rows].sort((a, b) => {
    const ai = order.get(a.id as (typeof PUBLIC_RESERVACIONES_PLAN_IDS)[number])
    const bi = order.get(b.id as (typeof PUBLIC_RESERVACIONES_PLAN_IDS)[number])
    if (ai != null && bi != null) return ai - bi
    if (ai != null) return -1
    if (bi != null) return 1
    return 0
  })
}
