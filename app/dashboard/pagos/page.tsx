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

export default async function PagosPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const page = parseListPage(params.page)
  const db = getDb()

  const pagos = await db
    .select({
      id: schema.payment.id,
      amount: schema.payment.amount,
      method: schema.payment.method,
      status: schema.payment.status,
      concept: schema.payment.concept,
      isNegative: schema.payment.isNegative,
      createdAt: schema.payment.createdAt,
      userName: schema.user.name,
    })
    .from(schema.payment)
    .innerJoin(schema.user, eq(schema.payment.userId, schema.user.id))
    .orderBy(desc(schema.payment.createdAt))
    .limit(LIST_PAGE_SIZE)
    .offset(listPaginationOffset(page))

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Pagos" description="Registro de pagos y cobros" />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  Sin pagos registrados
                </TableCell>
              </TableRow>
            ) : (
              pagos.map((p) => {
                const date = p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt as unknown as number)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.userName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.concept ?? "—"}</TableCell>
                    <TableCell className={`text-sm font-medium ${p.isNegative ? "text-destructive" : "text-green-600"}`}>
                      {p.isNegative ? "-" : ""}
                      {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(p.amount)}
                    </TableCell>
                    <TableCell className="text-sm">{p.method}</TableCell>
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

      <ListPagination basePath={routes.pagos} page={page} totalItems={pagos.length} />
    </div>
  )
}
