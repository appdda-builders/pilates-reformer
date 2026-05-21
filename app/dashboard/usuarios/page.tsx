export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq, like, or, desc, sql } from "drizzle-orm"
import { PageHeader } from "@/components/features/admin/page-header"
import { parseListPage, listPaginationOffset, LIST_PAGE_SIZE } from "@/lib/list-pagination"
import { ListPagination } from "@/components/features/admin/list-pagination"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/shared/ui/table"
import { Badge } from "@/components/shared/ui/badge"
import Link from "next/link"
import { routes } from "@/lib/routes"

type SearchParams = Promise<{ page?: string; q?: string }>

export default async function UsuariosPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const page = parseListPage(params.page)
  const q = params.q?.trim() ?? ""

  const db = getDb()

  const whereClause = q !== ""
    ? or(
        like(schema.user.name, `%${q}%`),
        like(schema.user.email, `%${q}%`),
        like(schema.user.displayId, `%${q}%`),
      )
    : eq(schema.user.role, "alumno")

  const [totalRows, users] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(schema.user).where(whereClause),
    db.select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      displayId: schema.user.displayId,
      role: schema.user.role,
      enabled: schema.user.enabled,
      createdAt: schema.user.createdAt,
    })
    .from(schema.user)
    .where(whereClause)
    .orderBy(desc(schema.user.createdAt))
    .limit(LIST_PAGE_SIZE)
    .offset(listPaginationOffset(page)),
  ])

  const total = totalRows[0]?.count ?? 0

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Usuarios" description="Gestión de alumnos y accesos" />

      <div className="rounded-lg border bg-card">
        <Table data-tour="page-table">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  Sin usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {u.displayId ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Link href={routes.usuarioDetail(u.id)} className="font-medium hover:underline">
                      {u.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.enabled ? "default" : "secondary"} className="text-xs">
                      {u.enabled ? "Activo" : "Inhabilitado"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ListPagination basePath={routes.usuarios} page={page} totalItems={Number(total)} />
    </div>
  )
}
