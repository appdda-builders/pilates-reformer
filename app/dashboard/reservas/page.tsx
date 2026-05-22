export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq, and, gte, lte, desc } from "drizzle-orm"
import { PageHeader } from "@/components/features/admin/page-header"
import { parseListPage, listPaginationOffset, LIST_PAGE_SIZE } from "@/lib/list-pagination"
import { ListPagination } from "@/components/features/admin/list-pagination"
import { Badge } from "@/components/shared/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/shared/ui/table"
import { routes } from "@/lib/routes"

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

type SearchParams = Promise<{ page?: string; fecha?: string }>

export default async function ReservasPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const page = parseListPage(params.page)
  const db = getDb()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const [totalRows, reservas] = await Promise.all([
    db.select({ count: schema.booking.id }).from(schema.booking)
      .where(and(eq(schema.booking.status, "confirmed"), gte(schema.booking.bookingDate, today))),
    db.select({
      id: schema.booking.id,
      status: schema.booking.status,
      bookingDate: schema.booking.bookingDate,
      userName: schema.user.name,
      className: schema.scheduleSlot.className,
      startTime: schema.scheduleSlot.startTime,
      dayOfWeek: schema.scheduleSlot.dayOfWeek,
    })
    .from(schema.booking)
    .innerJoin(schema.user, eq(schema.booking.userId, schema.user.id))
    .innerJoin(schema.scheduleSlot, eq(schema.booking.scheduleSlotId, schema.scheduleSlot.id))
    .where(gte(schema.booking.bookingDate, today))
    .orderBy(desc(schema.booking.bookingDate))
    .limit(LIST_PAGE_SIZE)
    .offset(listPaginationOffset(page)),
  ])

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Reservas" description="Reservas próximas confirmadas" />

      <div className="rounded-lg border bg-card">
        <Table data-tour="page-table">
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Clase</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  Sin reservas próximas
                </TableCell>
              </TableRow>
            ) : (
              reservas.map((r) => {
                const d = r.bookingDate instanceof Date ? r.bookingDate : new Date(r.bookingDate as unknown as number)
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.userName}</TableCell>
                    <TableCell className="text-sm">
                      {r.className} · {DAY_NAMES[r.dayOfWeek]} {r.startTime}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                        {r.status === "confirmed" ? "Confirmada" : r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ListPagination basePath={routes.reservas} page={page} totalItems={totalRows.length} />
    </div>
  )
}
