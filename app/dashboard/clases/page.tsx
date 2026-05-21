export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { PageHeader } from "@/components/features/admin/page-header"
import { Card, CardContent } from "@/components/shared/ui/card"
import { Badge } from "@/components/shared/ui/badge"

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

export default async function ClasesPage() {
  const db = getDb()
  const slots = await db
    .select()
    .from(schema.scheduleSlot)
    .orderBy(schema.scheduleSlot.dayOfWeek, schema.scheduleSlot.startTime)

  const active = slots.filter((s) => s.isActive)
  const inactive = slots.filter((s) => !s.isActive)

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Clases" description={`${active.length} clases activas`} />

      <div data-tour="clases-grid" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot) => (
          <Card key={slot.id} className={`border ${!slot.isActive ? "opacity-50" : ""}`}>
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{slot.className}</p>
                <Badge variant={slot.isActive ? "default" : "secondary"} className="text-xs">
                  {slot.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {DAY_NAMES[slot.dayOfWeek]} · {slot.startTime}
                {slot.endTime ? ` – ${slot.endTime}` : ""}
              </p>
              {slot.instructor && (
                <p className="text-xs text-muted-foreground">Coach: {slot.instructor}</p>
              )}
              <p className="text-xs text-muted-foreground">Capacidad: {slot.capacity}</p>
            </CardContent>
          </Card>
        ))}
        {slots.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-full text-center py-10">
            Sin clases configuradas
          </p>
        )}
      </div>
    </div>
  )
}
