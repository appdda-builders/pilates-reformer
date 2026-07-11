"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Ban, CalendarOff, CircleCheck, Clock, Pencil, Trash2, Users } from "lucide-react"
import { Badge } from "@/components/shared/ui/badge"
import { Button } from "@/components/shared/ui/button"
import { Card, CardContent } from "@/components/shared/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shared/ui/alert-dialog"
import { DbActionSuccessEffect } from "@/components/features/admin/db-action-feedback"
import { ConfirmRemoveDialog } from "@/components/features/admin/confirm-remove-dialog"
import {
  deleteSlotAction,
  setSlotWeekAvailabilityAction,
  toggleSlotAction,
  updateSlotAction,
  type ActionState,
} from "./actions"
import { formatSlotInstructorLabel } from "@/lib/schedule-instructor"
import { toLocalDateStr } from "@/lib/booking-slot-options"
import {
  occurrenceDateForWeek,
  upcomingWeekOptions,
} from "@/lib/slot-week-options"
import { SlotFormFields, type CoachOption, type SlotFormValues } from "./slot-form-fields"

const initial: ActionState = { success: false }

const DAY_NAMES_FULL = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
]

function classTypeLabel(classType: string): string {
  if (classType === "reformer") return "Pilates Reformer"
  if (classType === "mat") return "Pilates Mat"
  if (classType === "barre") return "Barre"
  if (classType === "mayores_60") return "Especial para mayores de 60 años"
  return "Otro"
}

function classTypeBadgeClass(classType: string): string {
  if (classType === "mat") return "bg-green-100 text-green-800 border-green-200"
  if (classType === "barre") return "bg-purple-100 text-purple-800 border-purple-200"
  if (classType === "mayores_60") return "bg-amber-100 text-amber-900 border-amber-200"
  if (classType === "otro") return "bg-gray-100 text-gray-800 border-gray-200"
  return "bg-orange-100 text-orange-800 border-orange-200"
}

function formatTime12h(time24: string): string {
  const parts = time24.split(":")
  const h = Number(parts[0])
  const m = parts[1] ?? "00"
  if (Number.isNaN(h)) return time24
  const suffix = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${m} ${suffix}`
}

export type SlotCardData = {
  id: string
  className: string
  instructor: string | null
  alternateInstructor: string | null
  scheduleMode: string
  dayOfWeek: number
  startTime: string
  endTime: string | null
  capacity: number
  classType: string
  isActive: boolean
  bookedToday: number
  disabledDates: string[]
}

export function SlotCard(props: {
  slot: SlotCardData
  coaches: CoachOption[]
  canManage: boolean
  compact?: boolean
}) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [weeksOpen, setWeeksOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [editState, editAction, editPending] = useActionState(updateSlotAction, initial)
  const [deleteState, deleteAction, deletePending] = useActionState(deleteSlotAction, initial)
  const [toggleState, toggleAction, togglePending] = useActionState(toggleSlotAction, initial)
  const [weekState, weekAction, weekPending] = useActionState(setSlotWeekAvailabilityAction, initial)

  useEffect(() => {
    if (editState.success) setEditOpen(false)
  }, [editState.success])

  useEffect(() => {
    if (deleteState.success) {
      setDeleteOpen(false)
      router.refresh()
    }
  }, [deleteState.success, router])

  useEffect(() => {
    if (weekState.success) {
      router.refresh()
    }
  }, [weekState.success, router])

  const slot = props.slot
  const available = slot.capacity - slot.bookedToday
  const dayName = DAY_NAMES_FULL[slot.dayOfWeek] ?? "—"
  const timeLabel = formatTime12h(slot.startTime)
  const titleLine = props.compact
    ? `${slot.className} · ${timeLabel}`
    : `${slot.className} - ${dayName} ${timeLabel}`
  const instructorLine = formatSlotInstructorLabel(slot)
  const disabledSet = new Set(slot.disabledDates)
  const weekOptions = upcomingWeekOptions(8).map((week) => {
    const occurrence = occurrenceDateForWeek(slot.dayOfWeek, week.monday)
    const dateStr = toLocalDateStr(occurrence)
    return {
      ...week,
      dateStr,
      available: !disabledSet.has(dateStr),
      dateLabel: occurrence.toLocaleDateString("es-MX", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    }
  })
  const disabledThisWeekCount = weekOptions.filter((w) => !w.available).length

  const formValues: SlotFormValues = {
    className: slot.className,
    instructor: slot.instructor ?? "",
    alternateInstructor: slot.alternateInstructor ?? "",
    scheduleMode: slot.scheduleMode ?? "fixed",
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime ?? "",
    capacity: slot.capacity,
    classType: slot.classType,
  }

  return (
    <>
      <DbActionSuccessEffect success={editState.success} kind="update" />
      <DbActionSuccessEffect success={toggleState.success} kind="update" />
      <DbActionSuccessEffect success={weekState.success} kind="update" />
      <DbActionSuccessEffect success={deleteState.success} kind="delete" />
      <div
        className={`flex h-full flex-col ${props.compact ? "min-h-0" : "min-h-[220px]"} ${!slot.isActive ? "opacity-60" : ""}`}
      >
        <Card className="flex min-h-0 flex-1 flex-col gap-0 border py-0 shadow-sm">
          <CardContent
            className={`flex h-full min-h-0 flex-1 flex-col ${props.compact ? "p-3" : "p-5"}`}
          >
          <div className={`flex items-start justify-between gap-2 ${props.compact ? "mb-1.5" : "mb-2"}`}>
            <div className="min-w-0 flex-1">
              <h3
                className={`font-semibold leading-snug ${props.compact ? "text-sm" : "text-base"}`}
              >
                {titleLine}
              </h3>
              <p
                className={`text-muted-foreground truncate ${props.compact ? "text-xs mt-0.5" : "text-sm mt-1"}`}
              >
                {instructorLine}
              </p>
            </div>
            {props.canManage ? (
            <div className={`flex shrink-0 ${props.compact ? "gap-0.5" : "gap-1"}`}>
              {slot.isActive ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={props.compact ? "h-7 w-7" : "h-8 w-8"}
                    onClick={() => setWeeksOpen(true)}
                  >
                    <CalendarOff className="h-4 w-4" />
                    <span className="sr-only">Disponibilidad por semana</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`text-destructive hover:text-destructive hover:bg-destructive/10 ${props.compact ? "h-7 w-7" : "h-8 w-8"}`}
                    disabled={togglePending}
                    onClick={() => setDeactivateOpen(true)}
                  >
                    <Ban className="h-4 w-4" />
                    <span className="sr-only">Desactivar clase</span>
                  </Button>
                  <ConfirmRemoveDialog
                    open={deactivateOpen}
                    onOpenChange={setDeactivateOpen}
                    title="¿Desactivar esta clase?"
                    description={`${titleLine} dejará de aparecer en el horario y no se podrá reservar.`}
                    confirmLabel="Sí, desactivar"
                    clientFormAction={toggleAction}
                    hiddenFields={[
                      { name: "id", value: slot.id },
                      { name: "isActive", value: "true" },
                    ]}
                    pending={togglePending}
                  />
                </>
              ) : (
                <form action={toggleAction}>
                  <input type="hidden" name="id" value={slot.id} />
                  <input type="hidden" name="isActive" value="false" />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className={`text-green-700 hover:text-green-700 hover:bg-green-100 ${props.compact ? "h-7 w-7" : "h-8 w-8"}`}
                    disabled={togglePending}
                  >
                    <CircleCheck className="h-4 w-4" />
                    <span className="sr-only">Activar clase</span>
                  </Button>
                </form>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={props.compact ? "h-7 w-7" : "h-8 w-8"}
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`text-destructive hover:text-destructive ${props.compact ? "h-7 w-7" : "h-8 w-8"}`}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Borrar</span>
              </Button>
            </div>
            ) : null}
          </div>

          <div className={`flex flex-wrap ${props.compact ? "mb-1 gap-1" : "gap-1.5"}`}>
            {!props.compact ? (
              <Badge variant="outline" className="text-xs bg-muted/50">
                {dayName}
              </Badge>
            ) : null}
            <Badge className={`text-xs border ${classTypeBadgeClass(slot.classType)}`}>
              {classTypeLabel(slot.classType)}
            </Badge>
            {slot.scheduleMode === "dual" || slot.scheduleMode === "alternating_weekly" ? (
              <Badge variant="outline" className="text-xs bg-sky-50 text-sky-800 border-sky-200">
                2 coaches
              </Badge>
            ) : null}
            {slot.isActive ? (
              <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Activo</Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Inactivo
              </Badge>
            )}
            {slot.isActive && disabledThisWeekCount > 0 ? (
              <Badge className="text-xs bg-amber-100 text-amber-900 border-amber-200">
                {disabledThisWeekCount} semana{disabledThisWeekCount === 1 ? "" : "s"} off
              </Badge>
            ) : null}
          </div>

          {props.compact ? null : <div className="flex-grow min-h-4" />}

          <div className={`mt-auto shrink-0 border-t ${props.compact ? "pt-2" : "pt-3"}`}>
            <div
              className={`flex items-center justify-between text-muted-foreground ${props.compact ? "text-xs" : "text-sm"}`}
            >
              <span className="inline-flex items-center gap-1">
                <Clock className={`shrink-0 ${props.compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
                {slot.startTime}
                {slot.endTime ? ` – ${slot.endTime}` : ""}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className={`shrink-0 ${props.compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
                <span
                  className={
                    available <= 0 ? "text-red-600 font-medium" : "text-foreground font-medium"
                  }
                >
                  {available}
                </span>
                {" / "}
                {slot.capacity} disponibles
              </span>
            </div>
            {toggleState.error ? (
              <p className="text-destructive text-xs mt-2">{toggleState.error}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
      </div>

      <Dialog open={weeksOpen} onOpenChange={setWeeksOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disponibilidad por semana</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Inhabilita solo la fecha de esta clase en una semana. El horario recurrente se mantiene.
          </p>
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {weekOptions.map((week) => (
              <div
                key={week.dateStr}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{week.label}</p>
                  <p className="text-xs text-muted-foreground capitalize">{week.dateLabel}</p>
                </div>
                <form action={weekAction}>
                  <input type="hidden" name="id" value={slot.id} />
                  <input type="hidden" name="date" value={week.dateStr} />
                  <input type="hidden" name="available" value={week.available ? "false" : "true"} />
                  <Button
                    type="submit"
                    size="sm"
                    variant={week.available ? "outline" : "default"}
                    className="text-xs h-8 shrink-0"
                    disabled={weekPending}
                  >
                    {week.available ? "Disponible" : "No disponible"}
                  </Button>
                </form>
              </div>
            ))}
          </div>
          {weekState.error ? <p className="text-destructive text-sm">{weekState.error}</p> : null}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar clase</DialogTitle>
          </DialogHeader>
          <form action={editAction} className="space-y-4">
            <input type="hidden" name="id" value={slot.id} />
            <SlotFormFields
              idPrefix={`edit-${slot.id}`}
              coaches={props.coaches}
              values={formValues}
              fieldErrors={editState.fieldErrors}
              showWeekAvailabilityHint
            />
            {editState.error ? <p className="text-destructive text-sm">{editState.error}</p> : null}
            <Button type="submit" className="w-full" disabled={editPending}>
              Guardar cambios
            </Button>
          </form>
          {slot.isActive ? (
            <div className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  setEditOpen(false)
                  setWeeksOpen(true)
                }}
              >
                <CalendarOff className="h-4 w-4" />
                Gestionar disponibilidad por semana
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar esta clase?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el horario de {slot.className} ({dayName} {slot.startTime}) y sus reservas
              asociadas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteState.error ? (
            <p className="text-destructive text-sm px-6">{deleteState.error}</p>
          ) : null}
          <form action={deleteAction}>
            <input type="hidden" name="id" value={slot.id} />
            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={deletePending}>
                Cancelar
              </AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                className="text-white"
                disabled={deletePending}
              >
                {deletePending ? "Borrando..." : "Borrar"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
