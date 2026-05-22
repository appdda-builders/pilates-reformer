export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { PageHeader } from "@/components/features/admin/page-header"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/shared/ui/table"

export default async function DevolucionesPage() {
  const db = getDb()

  const devoluciones = await db
    .select({
      id: schema.refund.id,
      refundDate: schema.refund.refundDate,
      classesUsed: schema.refund.classesUsed,
      classesRefunded: schema.refund.classesRefunded,
      costPerClass: schema.refund.costPerClass,
      refundAmount: schema.refund.refundAmount,
      reason: schema.refund.reason,
      userName: schema.user.name,
    })
    .from(schema.refund)
    .innerJoin(schema.user, eq(schema.refund.userId, schema.user.id))
    .orderBy(desc(schema.refund.refundDate))

  const fmt = new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", maximumFractionDigits: 2,
  })

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Devoluciones"
        description={`${devoluciones.length} registradas`}
      />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="text-muted-foreground font-normal text-sm">Usuario</TableHead>
              <TableHead className="text-muted-foreground font-normal text-sm">Fecha</TableHead>
              <TableHead className="text-muted-foreground font-normal text-sm">Clases usadas</TableHead>
              <TableHead className="text-muted-foreground font-normal text-sm">Clases devueltas</TableHead>
              <TableHead className="text-muted-foreground font-normal text-sm">Costo/clase</TableHead>
              <TableHead className="text-muted-foreground font-normal text-sm">Monto devuelto</TableHead>
              <TableHead className="text-muted-foreground font-normal text-sm">Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devoluciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Sin devoluciones registradas
                </TableCell>
              </TableRow>
            ) : (
              devoluciones.map((d) => {
                const date = d.refundDate instanceof Date
                  ? d.refundDate
                  : new Date(d.refundDate as unknown as number)
                return (
                  <TableRow key={d.id} className="border-b last:border-0">
                    <TableCell className="font-medium">{d.userName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{d.classesUsed}</TableCell>
                    <TableCell className="text-muted-foreground">{d.classesRefunded}</TableCell>
                    <TableCell className="text-muted-foreground">{fmt.format(d.costPerClass)}</TableCell>
                    <TableCell className="font-medium text-green-700">{fmt.format(d.refundAmount)}</TableCell>
                    <TableCell className="text-muted-foreground">{d.reason ?? "—"}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
