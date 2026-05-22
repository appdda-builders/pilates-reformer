export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq, and, gte, lte, sql } from "drizzle-orm"
import { PageHeader } from "@/components/features/admin/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card"
import { Users, BookOpen, DollarSign, Calendar } from "lucide-react"

export default async function ReportesPage() {
  const db = getDb()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [activeSubsRows, reservasRows, ingresosRows, clasesRows] = await Promise.all([
    db.select({ count: sql<number>`count(distinct ${schema.subscription.userId})` })
      .from(schema.subscription)
      .where(and(eq(schema.subscription.status, "active"), gte(schema.subscription.endDate, now))),
    db.select({ count: sql<number>`count(*)` })
      .from(schema.booking)
      .where(and(eq(schema.booking.status, "confirmed"), gte(schema.booking.bookingDate, startOfMonth))),
    db.select({ total: sql<number>`coalesce(sum(${schema.payment.amount}), 0)` })
      .from(schema.payment)
      .where(and(eq(schema.payment.status, "succeeded"), eq(schema.payment.isNegative, false), gte(schema.payment.createdAt, startOfMonth))),
    db.select({ count: sql<number>`count(*)` }).from(schema.scheduleSlot).where(eq(schema.scheduleSlot.isActive, true)),
  ])

  const metrics = [
    { title: "Usuarios Activos", value: String(activeSubsRows[0]?.count ?? 0), icon: Users },
    { title: "Reservas del Mes", value: String(reservasRows[0]?.count ?? 0), icon: BookOpen },
    { title: "Clases Activas", value: String(clasesRows[0]?.count ?? 0), icon: Calendar },
    {
      title: "Ingresos del Mes",
      value: new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })
        .format(Number(ingresosRows[0]?.total ?? 0)),
      icon: DollarSign,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Reportes"
        description={`Mes: ${now.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}`}
      />

      <div data-tour="reportes-metrics" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.title} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground tracking-wide">{m.title}</p>
                  <p className="text-2xl font-bold mt-1">{m.value}</p>
                </div>
                <div className="rounded-full p-2.5 bg-primary/10">
                  <m.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
