export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { PageHeader } from "@/components/features/admin/page-header"
import { Badge } from "@/components/shared/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/shared/ui/table"

export default async function CoachesPage() {
  const db = getDb()
  const coaches = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.role, "coach"))
    .orderBy(schema.user.name)

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Coaches" description="Personal instructor del estudio" />

      <div className="rounded-lg border bg-card">
        <Table data-tour="page-table">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  Sin coaches registrados
                </TableCell>
              </TableRow>
            ) : (
              coaches.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.phone ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={c.enabled ? "default" : "secondary"} className="text-xs">
                      {c.enabled ? "Activo" : "Inhabilitado"}
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
