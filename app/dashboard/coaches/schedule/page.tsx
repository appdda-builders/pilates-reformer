export const dynamic = "force-dynamic"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { and, asc, eq, gte } from "drizzle-orm"
import { PageHeader } from "@/components/features/admin/page-header"
import { Badge } from "@/components/shared/ui/badge"
import { Card, CardContent } from "@/components/shared/ui/card"
import { filterSlotsForCoach, getCoachSessionInfo } from "@/lib/coach-schedule-visibility"
import { isAlumnoRole, getSessionUserId } from "@/lib/alumno-scope"
import { formatSlotInstructorLabel } from "@/lib/schedule-instructor"
import { formatTimeRange12h } from "@/lib/time-utils"

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

function formatBookingDateLabel(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default async function CoachSchedulePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableRefresh: true },
  })
  const role = session?.user?.role ?? ""
  const userId = getSessionUserId(session?.user)
  const coachSession = getCoachSessionInfo(session?.user)
  const isAlumno = isAlumnoRole(role)

  const db = getDb()

  if (isAlumno && userId != null) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const rows = await db
      .select({
        bookingId: schema.booking.id,
        bookingDate: schema.booking.bookingDate,
        status: schema.booking.status,
        className: schema.scheduleSlot.className,
        startTime: schema.scheduleSlot.startTime,
        endTime: schema.scheduleSlot.endTime,
        instructor: schema.scheduleSlot.instructor,
        alternateInstructor: schema.scheduleSlot.alternateInstructor,
        scheduleMode: schema.scheduleSlot.scheduleMode,
      })
      .from(schema.booking)
      .innerJoin(schema.scheduleSlot, eq(schema.booking.scheduleSlotId, schema.scheduleSlot.id))
      .where(
        and(
          eq(schema.booking.userId, userId),
          eq(schema.booking.status, "confirmed"),
          gte(schema.booking.bookingDate, today),
        ),
      )
      .orderBy(asc(schema.booking.bookingDate), asc(schema.scheduleSlot.startTime))

    const grouped = new Map<string, typeof rows>()
    for (const row of rows) {
      const d =
        row.bookingDate instanceof Date
          ? row.bookingDate
          : new Date(row.bookingDate as unknown as number)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(row)
    }

    const days = Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b))

    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Mi Horario"
          description={`${rows.length} ${rows.length === 1 ? "clase reservada" : "clases reservadas"}`}
        />

        {days.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No tienes clases reservadas próximamente
          </p>
        ) : (
          <div className="space-y-8">
            {days.map(([key, dayBookings]) => {
              const firstDate =
                dayBookings[0].bookingDate instanceof Date
                  ? dayBookings[0].bookingDate
                  : new Date(dayBookings[0].bookingDate as unknown as number)
              return (
                <section key={key}>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {formatBookingDateLabel(firstDate)}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {dayBookings.map((row) => (
                      <Card key={row.bookingId} className="border shadow-sm">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-base">{row.className}</h3>
                            <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                              Confirmada
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>
                              {formatTimeRange12h(row.startTime, row.endTime)}
                            </p>
                            <p>
                              Instructor:{" "}
                              <span className="text-foreground">
                                {formatSlotInstructorLabel({
                                  instructor: row.instructor,
                                  alternateInstructor: row.alternateInstructor,
                                  scheduleMode: row.scheduleMode,
                                })}
                              </span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const allSlots = await db
    .select()
    .from(schema.scheduleSlot)
    .orderBy(schema.scheduleSlot.dayOfWeek, schema.scheduleSlot.startTime)

  const slots = filterSlotsForCoach(allSlots, coachSession)

  const grouped = new Map<number, typeof slots>()
  for (const slot of slots) {
    if (!grouped.has(slot.dayOfWeek)) grouped.set(slot.dayOfWeek, [])
    grouped.get(slot.dayOfWeek)!.push(slot)
  }

  const days = Array.from(grouped.entries()).sort(([a], [b]) => a - b)

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Mi Horario Semanal" description={`${slots.length} clases programadas`} />

      {days.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Sin clases programadas</p>
      ) : (
        <div className="space-y-8">
          {days.map(([dow, daySlots]) => (
            <section key={dow}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {DAY_NAMES[dow]}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {daySlots.map((slot) => (
                  <Card key={slot.id} className={`border shadow-sm ${!slot.isActive ? "opacity-60" : ""}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-base">{slot.className}</h3>
                        {slot.isActive ? (
                          <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Activo</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Inactivo</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          {formatTimeRange12h(slot.startTime, slot.endTime)}
                        </p>
                        <p>
                          Instructor:{" "}
                          <span className="text-foreground">
                            {formatSlotInstructorLabel(slot)}
                          </span>
                        </p>
                        <p>
                          Capacidad:{" "}
                          <span className="text-foreground font-medium">{slot.capacity}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
