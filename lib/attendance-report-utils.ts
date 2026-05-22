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
  const [h, m] = t.split(":")
  const hour = Number.parseInt(h, 10)
  const suffix = hour >= 12 ? "PM" : "AM"
  let display: number
  if (hour > 12) display = hour - 12
  else if (hour === 0) display = 12
  else display = hour
  return `${display}:${m} ${suffix}`
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
    year: "numeric",
  })
}
