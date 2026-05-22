export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq, desc, asc, count } from "drizzle-orm"
import {
  parseListSort,
  parseListSortDir,
  sortSearchParams,
  type ListSortDir,
} from "@/lib/list-sort"
import { sortPlansByDisplayOrder } from "@/lib/site/plans"
import { PageHeader } from "@/components/features/admin/page-header"
import { CreateSubscriptionDialog } from "./create-subscription-dialog"
import {
  isSubscriptionCurrent,
  isSubscriptionRenewable,
} from "@/lib/subscription-display"
import { SuscripcionesTable, type SuscripcionTableRow } from "./suscripciones-table"

const SUSCRIPCIONES_SORT_KEYS = ["displayId", "userName", "planName", "startDate", "endDate", "status"] as const
const SUSCRIPCIONES_DEFAULT_SORT = "startDate"

type SearchParams = Promise<{ page?: string; sort?: string; dir?: string }>

function suscripcionesOrderBy(sort: string, dir: ListSortDir) {
  const cols = {
    displayId: schema.user.displayId,
    userName: schema.user.name,
    planName: schema.plan.name,
    startDate: schema.subscription.startDate,
    endDate: schema.subscription.endDate,
    status: schema.subscription.status,
  } as const
  const col = cols[sort as keyof typeof cols] ?? schema.subscription.startDate
  if (dir === "desc") return desc(col)
  return asc(col)
}

export default async function SuscripcionesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const sort = parseListSort(params.sort, SUSCRIPCIONES_SORT_KEYS, SUSCRIPCIONES_DEFAULT_SORT)
  const dir = parseListSortDir(params.dir, "desc")
  const sortQuery = sortSearchParams(sort, dir, { sort: SUSCRIPCIONES_DEFAULT_SORT, dir: "desc" })

  const db = getDb()

  const [{ total: totalSubs }] = await db
    .select({ total: count() })
    .from(schema.subscription)

  const totalItems = Number(totalSubs)

  const [subs, alumnos, planes] = await Promise.all([
    db
      .select({
        id: schema.subscription.id,
        status: schema.subscription.status,
        startDate: schema.subscription.startDate,
        endDate: schema.subscription.endDate,
        daysUsedThisWeek: schema.subscription.daysUsedThisWeek,
        classesRemaining: schema.subscription.classesRemaining,
        discountPct: schema.subscription.discountPct,
        billingCycle: schema.subscription.billingCycle,
        userId: schema.user.id,
        userName: schema.user.name,
        userDisplayId: schema.user.displayId,
        planName: schema.plan.name,
        daysPerWeek: schema.plan.daysPerWeek,
        planType: schema.plan.planType,
      })
      .from(schema.subscription)
      .innerJoin(schema.user, eq(schema.subscription.userId, schema.user.id))
      .innerJoin(schema.plan, eq(schema.subscription.planId, schema.plan.id))
      .orderBy(suscripcionesOrderBy(sort, dir)),
    db
      .select({ id: schema.user.id, name: schema.user.name })
      .from(schema.user)
      .where(eq(schema.user.role, "alumno")),
    db
      .select({
        id: schema.plan.id,
        name: schema.plan.name,
        priceMxn: schema.plan.priceMxn,
        totalClasses: schema.plan.totalClasses,
        planType: schema.plan.planType,
      })
      .from(schema.plan)
      .where(eq(schema.plan.isActive, true)),
  ])

  const planesSorted = sortPlansByDisplayOrder(planes)

  const now = new Date()
  const tableRows: SuscripcionTableRow[] = subs.map((s) => {
    const start = s.startDate instanceof Date ? s.startDate : new Date(s.startDate as unknown as number)
    const end = s.endDate instanceof Date ? s.endDate : new Date(s.endDate as unknown as number)
    const isExpired = end < now
    const isCurrent = isSubscriptionCurrent(s.status, end, now)
    const isRenewable = isSubscriptionRenewable(s.status, end, now)
    const classesInfo =
      s.planType === "monthly"
        ? `${s.daysUsedThisWeek}/${s.daysPerWeek} días/sem`
        : s.classesRemaining != null
          ? `${s.classesRemaining} clases`
          : "Ilimitado"

    return {
      id: s.id,
      userId: s.userId,
      userName: s.userName,
      displayLabel: s.userDisplayId ?? "—",
      planName: s.planName,
      endDate: end,
      startLabel: start.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
      endLabel: end.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
      status: s.status,
      isExpired,
      isCurrent,
      isRenewable,
      classesInfo,
      discountLabel: s.discountPct ? `${Math.round(s.discountPct * 100)}%` : "—",
    }
  })

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Suscripciones" description={`${totalItems} en total`}>
        <CreateSubscriptionDialog alumnos={alumnos} planes={planesSorted} />
      </PageHeader>

      <SuscripcionesTable rows={tableRows} sort={sort} dir={dir} sortQuery={sortQuery} />
    </div>
  )
}
