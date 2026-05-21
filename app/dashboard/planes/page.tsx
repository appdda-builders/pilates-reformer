export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { PageHeader } from "@/components/features/admin/page-header"
import { Badge } from "@/components/shared/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/shared/ui/table"

export default async function PlanesPage() {
  const db = getDb()
  const planes = await db.select().from(schema.plan).orderBy(schema.plan.name)

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Planes" description="Catálogo de planes del estudio" />

      <div className="rounded-lg border bg-card">
        <Table data-tour="page-table">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {planes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  Sin planes configurados
                </TableCell>
              </TableRow>
            ) : (
              planes.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.planType}</TableCell>
                  <TableCell className="text-sm">
                    {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(p.priceMxn)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.durationDays} días</TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? "default" : "secondary"} className="text-xs">
                      {p.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
