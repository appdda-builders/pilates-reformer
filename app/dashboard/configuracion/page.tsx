export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { PageHeader } from "@/components/features/admin/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card"

export default async function ConfiguracionPage() {
  const db = getDb()
  const [policy] = await db.select().from(schema.studioPolicy).limit(1)

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Configuración" description="Ajustes generales del estudio" />

      <div data-tour="config-tabs" className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre del estudio</span>
              <span className="font-medium">{policy?.studioName ?? "Pilates Studio"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capacidad máxima</span>
              <span>{policy?.maxCapacity ?? 8} personas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total reformers</span>
              <span>{policy?.totalReformers ?? 8}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Políticas de reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hrs para cancelar</span>
              <span>{policy?.cancelHours ?? 12} hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ventana de reserva</span>
              <span>{policy?.bookingWindowDays ?? 7} días</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Máx. reservas/día</span>
              <span>{policy?.maxBookingsPerDay ?? 1}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
