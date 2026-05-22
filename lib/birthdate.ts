export function normalizeBirthdateInput(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T12:00:00`)
    if (Number.isNaN(d.getTime())) return null
    return trimmed
  }
  const slash = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(trimmed)
  if (slash) {
    const day = slash[1].padStart(2, "0")
    const month = slash[2].padStart(2, "0")
    const year = slash[3]
    return `${year}-${month}-${day}`
  }
  return null
}

export function getAgeYears(birthdateIso: string, onDate: Date): number | null {
  const normalized = normalizeBirthdateInput(birthdateIso)
  if (!normalized) return null
  const born = new Date(`${normalized}T12:00:00`)
  if (Number.isNaN(born.getTime())) return null
  const ref = new Date(onDate)
  ref.setHours(12, 0, 0, 0)
  let age = ref.getFullYear() - born.getFullYear()
  const monthDiff = ref.getMonth() - born.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < born.getDate())) {
    age -= 1
  }
  return age
}

export function isAtLeastAge(birthdateIso: string | null | undefined, minAge: number, onDate: Date): boolean {
  if (!birthdateIso) return false
  const age = getAgeYears(birthdateIso, onDate)
  if (age === null) return false
  return age >= minAge
}

const MONTH_NAME_ES: Record<string, string> = {
  ene: "enero",
  jan: "enero",
  feb: "febrero",
  mar: "marzo",
  abr: "abril",
  apr: "abril",
  may: "mayo",
  jun: "junio",
  jul: "julio",
  ago: "agosto",
  aug: "agosto",
  sep: "septiembre",
  oct: "octubre",
  nov: "noviembre",
  dic: "diciembre",
  dec: "diciembre",
}

export function birthdateMonthDayKey(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed.length === 0) return null

  const iso = normalizeBirthdateInput(trimmed)
  if (iso != null) {
    return iso.slice(5, 10)
  }

  const ddMon = /^(\d{1,2})[-/]([a-zA-Záéíóúñ]{3,})$/i.exec(trimmed)
  if (ddMon != null) {
    const day = Number(ddMon[1])
    const monthKey = ddMon[2].toLowerCase().slice(0, 3)
    const monthNum: Record<string, number> = {
      ene: 1,
      jan: 1,
      feb: 2,
      mar: 3,
      abr: 4,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      ago: 8,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dic: 12,
      dec: 12,
    }
    const month = monthNum[monthKey]
    if (month == null || day < 1 || day > 31) return null
    return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  return null
}

export function formatBirthdateDisplay(value: string | null | undefined): string {
  if (value == null) return "—"
  const trimmed = value.trim()
  if (trimmed.length === 0) return "—"

  const iso = normalizeBirthdateInput(trimmed)
  if (iso != null) {
    const d = new Date(`${iso}T12:00:00`)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
    }
  }

  const ddMon = /^(\d{1,2})[-/]([a-zA-Záéíóúñ]{3,})$/i.exec(trimmed)
  if (ddMon != null) {
    const day = Number(ddMon[1])
    const key = ddMon[2].toLowerCase().slice(0, 3)
    const monthLabel = MONTH_NAME_ES[key]
    if (monthLabel != null && day >= 1 && day <= 31) {
      return `${day} de ${monthLabel}`
    }
    return `${day} de ${ddMon[2]}`
  }

  return trimmed
}
