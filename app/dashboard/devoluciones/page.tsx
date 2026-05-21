export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { PageHeader } from "@/components/features/admin/page-header"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/shared/ui/table"

export default async function DevolucionesPage() {
  const db = getDb()
  const devoluciones = await db
    .select({
      id: schema.refund.id,
      refundAmount: schema.refund.refundAmount,
      classesRefunded: schema.refund.classesRefunded,
      reason: schema.refund.reason,
      refundDate: schema.refund.refundDate,
      userName: schema.user.name,
    })
    .from(schema.refund)
    .innerJoin(schema.user, eq(schema.refund.userId, schema.user.id))
    .orderBy(desc(schema.refund.refundDate))
    .limit(50)

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Devoluciones" description="Historial de reembolsos" />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Clases</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Razón</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devoluciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  Sin devoluciones registradas
                </TableCell>
              </TableRow>
            ) : (
              devoluciones.map((d) => {
                const date = d.refundDate instanceof Date ? d.refundDate : new Date(d.refundDate as unknown as number)
                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.userName}</TableCell>
                    <TableCell className="text-sm">{d.classesRefunded}</TableCell>
                    <TableCell className="text-sm text-destructive">
                      -{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(d.refundAmount)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.reason ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {date.toLocaleDateString("es-MX")}
                    </TableCell>
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
