import { Badge } from "@/components/shared/ui/badge"
import { Card, CardContent } from "@/components/shared/ui/card"
import { Clock } from "lucide-react"
import { attendanceStatusLabel, formatBookingDate, formatSlotTime } from "@/lib/attendance-report-utils"
import { formatSlotInstructorLabel } from "@/lib/schedule-instructor"

export type HistoricoBookingData = {
  bookingId: string
  bookingDate: Date
  attended: boolean | null
  className: string
  startTime: string
  endTime: string | null
  instructor: string | null
  alternateInstructor: string | null
  scheduleMode: string | null
  studentName?: string
  studentDisplayId?: string | null
}

function toDate(d: Date | number | unknown): Date {
  if (d instanceof Date) return d
  return new Date(d as number)
}

export function HistoricoBookingCard(props: {
  booking: HistoricoBookingData
  showAlumna?: boolean
}) {
  const b = props.booking
  const estado = attendanceStatusLabel(b.attended)
  const timeLabel = formatSlotTime(b.startTime)
  const dateLabel = formatBookingDate(toDate(b.bookingDate))
  const instructorLine = formatSlotInstructorLabel({
    instructor: b.instructor,
    alternateInstructor: b.alternateInstructor,
    scheduleMode: b.scheduleMode,
  })

  return (
    <Card className="flex h-full flex-col gap-0 border py-0 shadow-sm">
      <CardContent className="flex h-full flex-col p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-snug">
              {b.className} · {timeLabel}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{dateLabel}</p>
            {props.showAlumna && b.studentName ? (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {b.studentName}
                {b.studentDisplayId ? ` · ${b.studentDisplayId}` : ""}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{instructorLine}</p>
            )}
          </div>
          <Badge variant="outline" className={`shrink-0 text-xs ${estado.badgeClass}`}>
            {estado.label}
          </Badge>
        </div>

        <div className="mt-auto shrink-0 border-t pt-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {b.startTime}
            {b.endTime ? ` – ${b.endTime}` : ""}
          </span>
          {props.showAlumna && b.studentName ? (
            <p className="text-xs text-muted-foreground truncate mt-1">Coach: {instructorLine}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
