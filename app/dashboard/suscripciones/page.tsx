export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { PageHeader } from "@/components/features/admin/page-header"
import { parseListPage, listPaginationOffset, LIST_PAGE_SIZE } from "@/lib/list-pagination"
import { ListPagination } from "@/components/features/admin/list-pagination"
import { Badge } from "@/components/shared/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/shared/ui/table"
import { routes } from "@/lib/routes"

type SearchParams = Promise<{ page?: string }>

export default async function SuscripcionesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const page = parseListPage(params.page)
  const db = getDb()

  const subs = await db
    .select({
      id: schema.subscription.id,
      status: schema.subscription.status,
      startDate: schema.subscription.startDate,
      endDate: schema.subscription.endDate,
      classesRemaining: schema.subscription.classesRemaining,
      userName: schema.user.name,
      planId: schema.subscription.planId,
    })
    .from(schema.subscription)
    .innerJoin(schema.user, eq(schema.subscription.userId, schema.user.id))
    .orderBy(desc(schema.subscription.createdAt))
    .limit(LIST_PAGE_SIZE)
    .offset(listPaginationOffset(page))

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Suscripciones" description="Historial de planes por usuario" />

      <div className="rounded-lg border bg-card">
        <Table data-tour="page-table">
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Clases</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  Sin suscripciones
                </TableCell>
              </TableRow>
            ) : (
              subs.map((s) => {
                const start = s.startDate instanceof Date ? s.startDate : new Date(s.startDate as unknown as number)
                const end = s.endDate instanceof Date ? s.endDate : new Date(s.endDate as unknown as number)
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.userName}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs">
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {start.toLocaleDateString("es-MX")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {end.toLocaleDateString("es-MX")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.classesRemaining ?? "∞"}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ListPagination basePath={routes.suscripciones} page={page} totalItems={subs.length} />
    </div>
  )
}
