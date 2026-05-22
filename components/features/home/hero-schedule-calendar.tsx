"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/shared/ui/button"
import { HeroGlassPanel } from "@/components/features/home/hero-glass-panel"
import {
  formatWeekRange,
  getMondayOfWeek,
  scheduleDayLabels,
  type PublicScheduleSlot,
} from "@/lib/site/schedule"
import { findSlotAt, getBoardTimes } from "@/lib/site/schedule-board"
import { cn } from "@/lib/utils"

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

export function HeroScheduleCalendar(props: {
  slots: PublicScheduleSlot[]
  enrollments: Record<string, number>
}) {
  const [weekOffset, setWeekOffset] = useState(0)

  const monday = getMondayOfWeek(new Date(), weekOffset)
  const weekLabel = formatWeekRange(monday)
  const boardTimes = getBoardTimes(props.slots)
  const hasSlots = props.slots.length > 0

  function handlePrevWeek() {
    setWeekOffset(weekOffset - 1)
  }

  function handleNextWeek() {
    setWeekOffset(weekOffset + 1)
  }

  function getEnrolled(slot: PublicScheduleSlot, dayOfWeek: number): number {
    const dateStr = dateStrForWeekDay(monday, dayOfWeek)
    const key = enrollmentKey(slot.id, dateStr)
    return props.enrollments[key] ?? 0
  }

  return (
    <HeroGlassPanel className="flex h-full min-h-[352px] min-w-0 w-full max-w-full flex-col overflow-hidden p-[1.1rem] sm:p-[1.65rem]">
      <div className="mb-[1.1rem] flex items-center justify-between gap-2">
        <div className="text-left">
          <p className="font-display text-xl leading-tight">Horario semanal</p>
          {hasSlots ? (
            <p className="font-sans text-[0.825rem] font-semibold opacity-80">{weekLabel}</p>
          ) : null}
        </div>
        {hasSlots ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={handlePrevWeek}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={handleNextWeek}
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>

      {!hasSlots ? (
        <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center px-4 text-center">
          <p className="font-display text-lg leading-tight">Sin horarios por el momento</p>
          <p className="font-sans mt-2 text-[0.825rem] font-semibold opacity-80">
            Vuelve pronto o contáctanos para conocer la disponibilidad.
          </p>
        </div>
      ) : (
        <>
          <div className="scrollbar-hide min-w-0 flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-[520px] border-collapse text-[11px] sm:text-[0.825rem]">
              <thead>
                <tr>
                  <th className="font-sans border-primary-foreground/20 border-b border-r p-1 text-left font-bold opacity-70 sm:p-1.5">
                    Hora
                  </th>
                  {scheduleDayLabels.map((day) => (
                    <th
                      key={day.dayOfWeek}
                      className="font-sans border-primary-foreground/20 border-b p-1 text-center font-bold sm:p-1.5"
                    >
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {boardTimes.map((time) => (
                  <tr key={time}>
                    <td className="font-sans border-primary-foreground/15 border-r p-1 font-semibold opacity-80 sm:p-1.5">
                      {time}
                    </td>
                    {scheduleDayLabels.map((day) => {
                      const slot = findSlotAt(props.slots, day.dayOfWeek, time)
                      if (!slot) {
                        return (
                          <td
                            key={`${day.dayOfWeek}-${time}`}
                            className="border-primary-foreground/10 border-b p-0.5 text-center"
                          >
                            <span className="font-sans inline-block py-1 opacity-40">—</span>
                          </td>
                        )
                      }

                      const enrolled = getEnrolled(slot, day.dayOfWeek)
                      const full = enrolled >= slot.capacity
                      const title = `${enrolled} inscritos · aforo ${slot.capacity}`

                      return (
                        <td
                          key={`${day.dayOfWeek}-${time}`}
                          className="border-primary-foreground/10 border-b p-0.5 text-center"
                        >
                          <span
                            className="relative inline-flex"
                            title={title}
                          >
                            <span
                              className={cn(
                                "font-sans relative inline-flex h-[1.65rem] min-w-[3.25rem] items-center justify-center rounded-md px-2 text-[10px] font-bold sm:h-[1.925rem] sm:text-[0.825rem]",
                                "bg-[#1b4332] text-white",
                              )}
                            >
                              Clase
                              <span
                                className={cn(
                                  "absolute -top-1.5 -right-2 flex h-4 min-w-[1.65rem] items-center justify-center rounded-full px-1 text-[8px] font-bold leading-none sm:h-[1.1rem] sm:min-w-[1.925rem] sm:text-[9px]",
                                  enrolled > 0
                                    ? full
                                      ? "bg-red-600 text-white"
                                      : "bg-red-500 text-white"
                                    : "bg-primary-foreground/30 text-primary-foreground",
                                )}
                                aria-label={`${enrolled} de ${slot.capacity} inscritos`}
                              >
                                {enrolled}/{slot.capacity}
                              </span>
                            </span>
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="font-sans mt-[1.1rem] text-center text-[0.825rem] font-semibold opacity-90">
            La burbuja muestra inscritos / aforo
          </p>
        </>
      )}
    </HeroGlassPanel>
  )
}
