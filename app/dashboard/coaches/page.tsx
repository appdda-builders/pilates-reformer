export const dynamic = "force-dynamic"

import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { and, asc, eq, gte, isNotNull, lt, sql } from "drizzle-orm"
import { PageHeader } from "@/components/features/admin/page-header"
import { Badge } from "@/components/shared/ui/badge"
import { Button } from "@/components/shared/ui/button"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/shared/ui/table"
import { Clock } from "lucide-react"
import { routes } from "@/lib/routes"
import { NewCoachDialog } from "./new-coach-dialog"
import { CoachRowActions } from "./coach-row-actions"

function formatTime(t: string) {
  const [h, m] = t.split(":")
  const hour = Number.parseInt(h, 10)
  const suffix = hour >= 12 ? "PM" : "AM"
  let display: number
  if (hour > 12) display = hour - 12
  else if (hour === 0) display = 12
  else display = hour
  return `${display}:${m} ${suffix}`
}

export default async function CoachesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableRefresh: true },
  })
  const role = session?.user.role ?? ""
  const coachName = typeof session?.user.name === "string" ? session.user.name.trim() : ""
  const canManage = role === "admin" || role === "root"

  const db = getDb()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1)
  const tomorrowDow = tomorrow.getDay()

  const tomorrowSlots = await db
    .select({
      slotId: schema.scheduleSlot.id,
      className: schema.scheduleSlot.className,
      instructor: schema.scheduleSlot.instructor,
      startTime: schema.scheduleSlot.startTime,
      endTime: schema.scheduleSlot.endTime,
      capacity: schema.scheduleSlot.capacity,
    })
    .from(schema.scheduleSlot)
    .where(
      and(
        eq(schema.scheduleSlot.dayOfWeek, tomorrowDow),
        eq(schema.scheduleSlot.isActive, true),
      ),
    )
    .orderBy(schema.scheduleSlot.startTime)

  const tomorrowBookingCounts = await db
    .select({
      slotId: schema.booking.scheduleSlotId,
      count: sql<number>`count(*)`,
    })
    .from(schema.booking)
    .where(
      and(
        gte(schema.booking.bookingDate, tomorrow),
        lt(schema.booking.bookingDate, tomorrowEnd),
        eq(schema.booking.status, "confirmed"),
      ),
    )
    .groupBy(schema.booking.scheduleSlotId)

  const bookingCountMap = new Map<string, number>()
  for (const row of tomorrowBookingCounts) {
    bookingCountMap.set(row.slotId, row.count)
  }

  let displaySlots = tomorrowSlots
  if (role === "coach" && coachName !== "") {
    displaySlots = tomorrowSlots.filter((s) => (s.instructor ?? "").trim() === coachName)
  }

  const coachTomorrowCount = role === "coach" ? displaySlots.length : tomorrowSlots.length

  const coachUsers = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      phone: schema.user.phone,
      enabled: schema.user.enabled,
    })
    .from(schema.user)
    .where(eq(schema.user.role, "coach"))
    .orderBy(asc(schema.user.name))

  const bookingsThisMonth = await db
    .select({
      instructor: schema.scheduleSlot.instructor,
      count: sql<number>`count(*)`,
    })
    .from(schema.booking)
    .innerJoin(schema.scheduleSlot, eq(schema.booking.scheduleSlotId, schema.scheduleSlot.id))
    .where(
      and(
        isNotNull(schema.scheduleSlot.instructor),
        gte(schema.booking.bookingDate, startOfMonth),
        eq(schema.booking.status, "confirmed"),
      ),
    )
    .groupBy(schema.scheduleSlot.instructor)

  const monthMap = new Map<string, number>()
  for (const row of bookingsThisMonth) {
    if (row.instructor) monthMap.set(row.instructor, row.count)
  }

  const slotStats = await db
    .select({
      instructor: schema.scheduleSlot.instructor,
      activeSlots: sql<number>`sum(case when ${schema.scheduleSlot.isActive} then 1 else 0 end)`,
    })
    .from(schema.scheduleSlot)
    .where(isNotNull(schema.scheduleSlot.instructor))
    .groupBy(schema.scheduleSlot.instructor)

  const activeSlotMap = new Map<string, number>()
  for (const row of slotStats) {
    if (row.instructor) activeSlotMap.set(row.instructor, row.activeSlots ?? 0)
  }

  const tomorrowLabel = tomorrow.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const emptyTomorrowMsg =
    role === "coach"
      ? "Mañana no tienes clases programadas."
      : "No hay clases programadas para mañana."

  return (
    <div className="p-6 space-y-6">
      {role === "coach" ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm space-y-1">
            <div className="font-medium">
              Mañana tienes {coachTomorrowCount} clase(s)
            </div>
            <div className="text-muted-foreground">
              Revisa tu horario y las reservas confirmadas.
            </div>
          </div>
          <Button asChild className="shrink-0">
            <Link href={routes.coachSchedule}>Ver detalles</Link>
          </Button>
        </div>
      ) : null}

      <section data-tour="coaches-tomorrow">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Clases de mañana — {tomorrowLabel}
          </h2>
        </div>

        {displaySlots.length === 0 ? (
          <div className="rounded-lg border bg-card px-5 py-4 text-sm text-muted-foreground">
            {emptyTomorrowMsg}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displaySlots.map((slot) => {
              const confirmed = bookingCountMap.get(slot.slotId) ?? 0
              return (
                <div key={slot.slotId} className="rounded-lg border bg-card px-4 py-3 space-y-1">
                  <p className="font-medium text-sm">{slot.className}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(slot.startTime)}
                    {slot.endTime ? ` – ${formatTime(slot.endTime)}` : ""}
                  </p>
                  {slot.instructor ? (
                    <p className="text-xs text-muted-foreground">{slot.instructor}</p>
                  ) : null}
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className="text-xs">
                      {confirmed} / {slot.capacity} confirmadas
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <PageHeader title="Coaches" description={`${coachUsers.length} registrados`}>
        {canManage ? <NewCoachDialog /> : null}
      </PageHeader>

      <div data-tour="page-table" className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="text-muted-foreground font-normal text-sm">Nombre</TableHead>
              <TableHead className="text-muted-foreground font-normal text-sm">Correo</TableHead>
              <TableHead className="text-muted-foreground font-normal text-sm">Clases este mes</TableHead>
              <TableHead className="text-muted-foreground font-normal text-sm">Horarios activos</TableHead>
              <TableHead className="text-muted-foreground font-normal text-sm">Acceso</TableHead>
              {canManage ? (
                <TableHead className="text-muted-foreground font-normal text-sm text-right">
                  Acciones
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {coachUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canManage ? 6 : 5}
                  className="text-center text-muted-foreground py-8"
                >
                  Sin coaches registrados
                </TableCell>
              </TableRow>
            ) : (
              coachUsers.map((coach) => {
                const classesMonth = monthMap.get(coach.name) ?? 0
                const activeSlots = activeSlotMap.get(coach.name) ?? 0
                const enabled = coach.enabled !== false
                return (
                  <TableRow key={coach.id} className="border-b last:border-0">
                    <TableCell className="font-medium">{coach.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{coach.email}</TableCell>
                    <TableCell className="text-muted-foreground">{classesMonth}</TableCell>
                    <TableCell className="text-muted-foreground">{activeSlots}</TableCell>
                    <TableCell>
                      {enabled ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inhabilitado</Badge>
                      )}
                    </TableCell>
                    {canManage ? (
                      <TableCell className="text-right">
                        <CoachRowActions
                          coach={{
                            id: coach.id,
                            name: coach.name,
                            email: coach.email,
                            phone: coach.phone,
                            enabled,
                          }}
                        />
                      </TableCell>
                    ) : null}
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
