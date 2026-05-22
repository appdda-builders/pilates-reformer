"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { SortableTableHead } from "@/components/features/admin/sortable-table-head"
import { Badge } from "@/components/shared/ui/badge"
import { Button } from "@/components/shared/ui/button"
import { Input } from "@/components/shared/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/ui/table"
import { CancelIconConfirm } from "@/components/features/admin/cancel-icon-confirm"
import { routes } from "@/lib/routes"
import { buildSortHref } from "@/lib/list-sort"
import type { ListSortDir } from "@/lib/list-sort"
import { filterPrimarySubscriptionsPerUser } from "@/lib/subscription-display"
import { RenewSubscriptionButton } from "./renew-subscription-button"
import { SubscriptionStatusForm } from "./subscription-status-form"
import { setSubscriptionStatusAction } from "./actions"

export type SuscripcionTableRow = {
  id: string
  userId: string
  userName: string
  displayLabel: string
  planName: string
  endDate: Date
  startLabel: string
  endLabel: string
  status: string
  isExpired: boolean
  isCurrent: boolean
  isRenewable: boolean
  classesInfo: string
  discountLabel: string
}

function statusBadge(row: SuscripcionTableRow) {
  if (row.status === "cancelled") {
    return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelada</Badge>
  }
  if (row.isCurrent) {
    return <Badge className="bg-green-100 text-green-700 border-green-200">Activa</Badge>
  }
  if (row.isRenewable) {
    return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Vencida</Badge>
  }
  if (row.status === "active") {
    return <Badge className="bg-green-100 text-green-700 border-green-200">Activa</Badge>
  }
  if (row.status === "renovacion") {
    return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Renovación</Badge>
  }
  if (row.status === "pendiente") {
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pendiente</Badge>
  }
  if (row.status === "suspended") {
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Suspendida</Badge>
  }
  if (row.isExpired) {
    return <Badge className="bg-muted text-muted-foreground">Finalizada</Badge>
  }
  return <Badge variant="secondary">{row.status}</Badge>
}

function rowMatchesSearch(row: SuscripcionTableRow, query: string) {
  const id = row.displayLabel.toLowerCase()
  const name = row.userName.toLowerCase()
  const plan = row.planName.toLowerCase()
  return id.includes(query) || name.includes(query) || plan.includes(query)
}

const SUSCRIPCIONES_DEFAULT_SORT = "startDate"

export function SuscripcionesTable(props: {
  rows: SuscripcionTableRow[]
  sort: string
  dir: ListSortDir
  sortQuery: Record<string, string | undefined>
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showHistorial, setShowHistorial] = useState(false)
  const q = searchQuery.trim().toLowerCase()

  const baseRows = showHistorial || q !== ""
    ? props.rows
    : filterPrimarySubscriptionsPerUser(props.rows)

  const visibleRows = q === "" ? baseRows : baseRows.filter((row) => rowMatchesSearch(row, q))
  const historialCount = props.rows.length - filterPrimarySubscriptionsPerUser(props.rows).length

  return (
    <div data-tour="page-table" className="rounded-lg border bg-card">
      <div className="border-b p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={showHistorial ? "outline" : "default"}
            size="sm"
            onClick={() => setShowHistorial(false)}
          >
            Plan vigente
          </Button>
          <Button
            type="button"
            variant={showHistorial ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHistorial(true)}
          >
            Ver historial
            {historialCount > 0 ? ` (${props.rows.length})` : null}
          </Button>
        </div>
        {!showHistorial && q === "" && historialCount > 0 ? (
          <p className="text-sm text-muted-foreground">
            Mostrando el plan vigente o el que requiere acción por alumno. {historialCount} registro
            {historialCount === 1 ? "" : "s"} anterior
            {historialCount === 1 ? "" : "es"} en historial.
          </p>
        ) : null}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID, nombre o plan…"
            className="pl-9"
            aria-label="Buscar suscripciones"
          />
        </div>
        {q !== "" ? (
          <p className="text-sm text-muted-foreground">
            {visibleRows.length} de {baseRows.length} suscripciones
          </p>
        ) : null}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            <SortableTableHead
              className="text-muted-foreground font-normal text-sm"
              href={buildSortHref(routes.suscripciones, props.sort, "displayId", props.dir, props.sortQuery, { sort: SUSCRIPCIONES_DEFAULT_SORT, dir: "desc" })}
              active={props.sort === "displayId"}
              dir={props.dir}
            >
              ID
            </SortableTableHead>
            <SortableTableHead
              className="text-muted-foreground font-normal text-sm"
              href={buildSortHref(routes.suscripciones, props.sort, "userName", props.dir, props.sortQuery, { sort: SUSCRIPCIONES_DEFAULT_SORT, dir: "desc" })}
              active={props.sort === "userName"}
              dir={props.dir}
            >
              Usuario
            </SortableTableHead>
            <SortableTableHead
              className="text-muted-foreground font-normal text-sm"
              href={buildSortHref(routes.suscripciones, props.sort, "planName", props.dir, props.sortQuery, { sort: SUSCRIPCIONES_DEFAULT_SORT, dir: "desc" })}
              active={props.sort === "planName"}
              dir={props.dir}
            >
              Plan
            </SortableTableHead>
            <SortableTableHead
              className="text-muted-foreground font-normal text-sm"
              href={buildSortHref(routes.suscripciones, props.sort, "startDate", props.dir, props.sortQuery, { sort: SUSCRIPCIONES_DEFAULT_SORT, dir: "desc" })}
              active={props.sort === "startDate"}
              dir={props.dir}
            >
              Inicio
            </SortableTableHead>
            <SortableTableHead
              className="text-muted-foreground font-normal text-sm"
              href={buildSortHref(routes.suscripciones, props.sort, "endDate", props.dir, props.sortQuery, { sort: SUSCRIPCIONES_DEFAULT_SORT, dir: "desc" })}
              active={props.sort === "endDate"}
              dir={props.dir}
            >
              Fin
            </SortableTableHead>
            <SortableTableHead
              className="text-muted-foreground font-normal text-sm"
              href={buildSortHref(routes.suscripciones, props.sort, "status", props.dir, props.sortQuery, { sort: SUSCRIPCIONES_DEFAULT_SORT, dir: "desc" })}
              active={props.sort === "status"}
              dir={props.dir}
            >
              Estado
            </SortableTableHead>
            <TableHead className="text-muted-foreground font-normal text-sm">Clases/Días</TableHead>
            <TableHead className="text-muted-foreground font-normal text-sm">Descuento</TableHead>
            <TableHead className="text-muted-foreground font-normal text-sm">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                Sin suscripciones
              </TableCell>
            </TableRow>
          ) : visibleRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                Ninguna suscripción coincide con la búsqueda
              </TableCell>
            </TableRow>
          ) : (
            visibleRows.map((row) => (
              <TableRow
                key={row.id}
                className={
                  row.isCurrent
                    ? "border-b last:border-0 bg-green-50/40"
                    : row.status === "cancelled"
                      ? "border-b last:border-0 opacity-60"
                      : "border-b last:border-0"
                }
              >
                <TableCell className="text-muted-foreground text-sm font-mono">
                  <Link
                    className="underline underline-offset-2 hover:text-foreground"
                    href={routes.usuarioDetail(row.userId)}
                  >
                    {row.displayLabel}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{row.userName}</TableCell>
                <TableCell>{row.planName}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{row.startLabel}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{row.endLabel}</TableCell>
                <TableCell>{statusBadge(row)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{row.classesInfo}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{row.discountLabel}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    {row.isRenewable ? (
                      <RenewSubscriptionButton
                        subscriptionId={row.id}
                        userName={row.userName}
                        planName={row.planName}
                      />
                    ) : null}
                    {row.isCurrent ? (
                      <CancelIconConfirm
                        action={setSubscriptionStatusAction}
                        hiddenFields={[
                          { name: "id", value: row.id },
                          { name: "status", value: "cancelled" },
                        ]}
                        title="¿Cancelar esta suscripción?"
                        description={`Se cancelará la suscripción de ${row.userName} (${row.planName}).`}
                      />
                    ) : null}
                    {!row.isCurrent && !row.isRenewable && row.status !== "active" && row.status !== "cancelled" ? (
                      <SubscriptionStatusForm
                        subscriptionId={row.id}
                        status="active"
                        label="Activar"
                        variant="ghost"
                        className="text-xs text-primary hover:underline h-auto p-0"
                      />
                    ) : null}
                    {row.status === "cancelled" && !row.isCurrent ? (
                      <span className="text-xs text-muted-foreground">Historial</span>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
