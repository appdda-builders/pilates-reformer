export type StudioPlanDefinition = {
  id: string
  name: string
  planType: "class_pack" | "add_on"
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
] as const

export const PLAN_DISPLAY_ORDER = STUDIO_PLAN_DEFINITIONS.map((p) => p.id)

export const SINGLE_CLASS_LABEL = "Clase individual"

export const FREE_SAMPLE_PLAN_ID = "plan-apertura"

export const FREE_SAMPLE_CLASS_LABEL = "Clase muestra gratis"

export type PublicPlan = {
  id: string
  name: string
  includes: string
  validity: string
  priceLabel: string
  isTotalPass: boolean
  badge: string | null
}

export function planPromoBadge(planId: string): string | null {
  if (planId === FREE_SAMPLE_PLAN_ID) return FREE_SAMPLE_CLASS_LABEL
  return null
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

export function formatPlanTypeLabel(planType: string): string {
  if (planType === "class_pack") return "Paquete de clases"
  if (planType === "monthly") return "Mensual"
  if (planType === "add_on") return "Complemento"
  if (planType === "total_pass") return "Pase total"
  return planType
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
  _planType: string,
  totalClasses: number | null,
  isUnlimited: boolean,
): string {
  if (planType === "total_pass" || isUnlimited) return "Acceso flexible"
  if (totalClasses === 1) return SINGLE_CLASS_LABEL
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
  return {
    id: row.id,
    name: row.name,
    includes: formatPlanIncludes(row.planType, row.totalClasses, row.isUnlimited),
    validity: formatPlanValidity(row.durationDays),
    priceLabel: formatPublicPlanPrice(row.planType, row.priceMxn),
    isTotalPass,
    badge: planPromoBadge(row.id),
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
  const preferred = new Map(
    PUBLIC_RESERVACIONES_PLAN_IDS.map((id, index) => [id, index]),
  )
  const fallback = new Map(PLAN_DISPLAY_ORDER.map((id, index) => [id, index]))
  return [...rows].sort((a, b) => {
    const ap = preferred.get(a.id as (typeof PUBLIC_RESERVACIONES_PLAN_IDS)[number])
    const bp = preferred.get(b.id as (typeof PUBLIC_RESERVACIONES_PLAN_IDS)[number])
    if (ap != null && bp != null) return ap - bp
    if (ap != null) return -1
    if (bp != null) return 1
    const af = fallback.get(a.id)
    const bf = fallback.get(b.id)
    if (af != null && bf != null) return af - bf
    if (af != null) return -1
    if (bf != null) return 1
    return a.id.localeCompare(b.id)
  })
}

export type PlanDuplicateCandidate = {
  id: string
  name: string
  planType: string
  daysPerWeek: number
  totalClasses: number | null
  priceMxn: number
  durationDays: number
  isActive: boolean
}

export type PlanDuplicateIncoming = {
  name: string
  planType: string
  daysPerWeek: number
  totalClasses: number | null
  priceMxn: number
  durationDays: number
}

export function normalizePlanName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase()
}

export function plansHaveSameName(a: string, b: string): boolean {
  return normalizePlanName(a) === normalizePlanName(b)
}

export function plansHaveSameCharacteristics(
  a: Omit<PlanDuplicateIncoming, "name">,
  b: Omit<PlanDuplicateIncoming, "name">,
): boolean {
  return (
    a.planType === b.planType &&
    a.daysPerWeek === b.daysPerWeek &&
    (a.totalClasses ?? null) === (b.totalClasses ?? null) &&
    a.priceMxn === b.priceMxn &&
    a.durationDays === b.durationDays
  )
}

export function findDuplicatePlan(
  candidates: PlanDuplicateCandidate[],
  incoming: PlanDuplicateIncoming,
  excludeId?: string,
): { reason: "name" | "characteristics"; plan: PlanDuplicateCandidate } | null {
  for (const plan of candidates) {
    if (!plan.isActive) continue
    if (excludeId != null && plan.id === excludeId) continue
    if (plansHaveSameName(plan.name, incoming.name)) {
      return { reason: "name", plan }
    }
    if (plansHaveSameCharacteristics(plan, incoming)) {
      return { reason: "characteristics", plan }
    }
  }
  return null
}

export function duplicatePlanErrorMessage(
  duplicate: { reason: "name" | "characteristics"; plan: PlanDuplicateCandidate },
): string {
  if (duplicate.reason === "name") {
    return `Ya existe un plan activo con el nombre "${duplicate.plan.name}".`
  }
  return `Ya existe un plan activo con las mismas características ("${duplicate.plan.name}").`
}
