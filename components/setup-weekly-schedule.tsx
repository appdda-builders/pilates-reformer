"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  demoScheduleSlots,
  formatWeekRange,
  getMondayOfWeek,
  scheduleDayLabels,
  type PublicScheduleSlot,
} from "@/lib/site/schedule"
import { formatSlotTime } from "@/lib/attendance-report-utils"
import { findSlotAt, getBoardTimes } from "@/lib/site/schedule-board"

const demoEnrollments: Record<string, number> = {
  "s1|2026-05-18": 0,
  "s7|2026-05-19": 3,
  "s13|2026-05-20": 8,
  "s24|2026-05-18": 2,
  "s29|2026-05-19": 5,
}

function dateStrForWeekDay(monday: Date, dayOfWeek: number): string {
  const d = new Date(monday)
  d.setDate(monday.getDate() + (dayOfWeek - 1))
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function enrollmentKey(slotId: string, dateStr: string) {
  return `${slotId}|${dateStr}`
}

export default function SetupWeeklySchedule({
  onSelectClass,
}: {
  onSelectClass?: () => void
} = {}) {
  const [weekOffset, setWeekOffset] = useState(0)
  const slots: PublicScheduleSlot[] = demoScheduleSlots
  const enrollments = demoEnrollments

  const monday = getMondayOfWeek(new Date(), weekOffset)
  const weekLabel = formatWeekRange(monday)
  const boardTimes = getBoardTimes(slots)

  function getEnrolled(slot: PublicScheduleSlot, dayOfWeek: number): number {
    const dateStr = dateStrForWeekDay(monday, dayOfWeek)
    const key = enrollmentKey(slot.id, dateStr)
    return enrollments[key] ?? 0
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-display text-xl leading-tight">Horario semanal</p>
          <p className="text-xs font-semibold text-white/70">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-inner border border-white/10 bg-white/5 p-2">
        <table className="w-full min-w-[480px] border-collapse text-[11px] sm:text-xs">
          <thead>
            <tr>
              <th className="border-b border-r border-white/15 p-1.5 text-left font-bold text-white/70 sm:p-2">
                Hora
              </th>
              {scheduleDayLabels.map((day) => (
                <th
                  key={day.dayOfWeek}
                  className="border-b border-white/15 p-1.5 text-center font-bold text-white/90 sm:p-2"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {boardTimes.map((time) => (
              <tr key={time}>
                <td className="border-r border-white/10 p-1.5 font-semibold text-white/75 sm:p-2">
                  {formatSlotTime(time)}
                </td>
                {scheduleDayLabels.map((day) => {
                  const slot = findSlotAt(slots, day.dayOfWeek, time)
                  if (!slot) {
                    return (
                      <td
                        key={`${day.dayOfWeek}-${time}`}
                        className="border-b border-white/10 p-1 text-center"
                      >
                        <span className="inline-block py-1 text-white/35">—</span>
                      </td>
                    )
                  }

                  const enrolled = getEnrolled(slot, day.dayOfWeek)
                  const full = enrolled >= slot.capacity
                  const title = `${enrolled} inscritos · aforo ${slot.capacity}`

                  return (
                    <td
                      key={`${day.dayOfWeek}-${time}`}
                      className="border-b border-white/10 p-1 text-center"
                    >
                      <button
                        type="button"
                        onClick={onSelectClass}
                        title={title}
                        className="relative inline-flex h-7 min-w-[3.25rem] cursor-pointer items-center justify-center rounded-md bg-green-base px-2 text-[10px] font-bold text-white transition hover:bg-green-hover sm:h-8 sm:text-xs"
                      >
                        Clase
                        <span
                          className={`absolute -top-1.5 -right-2 flex h-4 min-w-[1.65rem] items-center justify-center rounded-full px-1 text-[8px] font-bold leading-none sm:text-[9px] ${enrolled > 0
                            ? full
                              ? "bg-red-600 text-white"
                              : "bg-red-500 text-white"
                            : "bg-white/30 text-white"
                            }`}
                        >
                          {enrolled}/{slot.capacity}
                        </span>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-xs font-semibold text-white/70">
        La burbuja muestra inscritos / aforo
      </p>
    </div>
  )
}
