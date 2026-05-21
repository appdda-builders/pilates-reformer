export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq, lte, desc } from "drizzle-orm"
import { PageHeader } from "@/components/features/admin/page-header"
import { Badge } from "@/components/shared/ui/badge"
import { parseListPage, listPaginationOffset, LIST_PAGE_SIZE } from "@/lib/list-pagination"
import { ListPagination } from "@/components/features/admin/list-pagination"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/shared/ui/table"
import { routes } from "@/lib/routes"

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

type SearchParams = Promise<{ page?: string }>

export default async function HistoricoPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const page = parseListPage(params.page)
  const db = getDb()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const historico = await db
    .select({
      id: schema.booking.id,
      status: schema.booking.status,
      bookingDate: schema.booking.bookingDate,
      attended: schema.booking.attended,
      userName: schema.user.name,
      className: schema.scheduleSlot.className,
      startTime: schema.scheduleSlot.startTime,
      dayOfWeek: schema.scheduleSlot.dayOfWeek,
    })
    .from(schema.booking)
    .innerJoin(schema.user, eq(schema.booking.userId, schema.user.id))
    .innerJoin(schema.scheduleSlot, eq(schema.booking.scheduleSlotId, schema.scheduleSlot.id))
    .where(lte(schema.booking.bookingDate, today))
    .orderBy(desc(schema.booking.bookingDate))
    .limit(LIST_PAGE_SIZE)
    .offset(listPaginationOffset(page))

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Histórico" description="Reservas pasadas" />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Clase</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Asistió</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historico.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  Sin historial
                </TableCell>
              </TableRow>
            ) : (
              historico.map((b) => {
                const d = b.bookingDate instanceof Date ? b.bookingDate : new Date(b.bookingDate as unknown as number)
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.userName}</TableCell>
                    <TableCell className="text-sm">{b.className} · {b.startTime}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.toLocaleDateString("es-MX")}
                    </TableCell>
                    <TableCell>
                      {b.attended === null ? (
                        <span className="text-muted-foreground text-xs">—</span>
                      ) : (
                        <Badge variant={b.attended ? "default" : "destructive"} className="text-xs">
                          {b.attended ? "Sí" : "No"}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ListPagination basePath={routes.historico} page={page} totalItems={historico.length} />
    </div>
  )
}
