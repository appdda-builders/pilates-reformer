import { formatTime12h } from "@/lib/time-utils"

export type AttendanceRow = {
  attended: boolean | null
}

export function countAttendanceStats(rows: AttendanceRow[]) {
  let asistio = 0
  let noAsistio = 0
  let pendiente = 0
  for (const row of rows) {
    if (row.attended === true) asistio++
    else if (row.attended === false) noAsistio++
    else pendiente++
  }
  return { asistio, noAsistio, pendiente }
}

export function formatSlotTime(t: string) {
  return formatTime12h(t)
}

export function attendanceStatusLabel(attended: boolean | null) {
  if (attended === true) {
    return { label: "Asistió", badgeClass: "border-green-300 bg-green-50 text-green-800" }
  }
  if (attended === false) {
    return { label: "No asistió", badgeClass: "border-red-300 bg-red-50 text-red-800" }
  }
  return { label: "Pendiente", badgeClass: "border-muted-foreground/30 text-muted-foreground" }
}

export function formatBookingDate(date: Date) {
  return date.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}
