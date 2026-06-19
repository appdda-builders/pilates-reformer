"use client"

import { useActionState, useEffect, useState } from "react"
import { Button } from "@/components/shared/ui/button"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { DbActionSuccessEffect } from "@/components/features/admin/db-action-feedback"
import {
  type BookingSlotOption,
  filterSlotsForBookingDate,
  formatBookingDateEs,
  formatSlotLabel,
  getDayOfWeekFromDateStr,
  nextDateWithSlots,
  resolveBookingDefaultDate,
} from "@/lib/booking-slot-options"

export type BookingFormState = {
  success: boolean
  error?: string
  message?: string
  bookedDate?: string
  fieldErrors?: Record<string, string[]>
}

type Props = {
  slots: BookingSlotOption[]
  defaultDate: string
  submitLabel: string
  action: (prev: BookingFormState, formData: FormData) => Promise<BookingFormState>
  onSuccess?: (bookedDate: string) => void
  onCheckEligibility?: (
    displayId: string,
    scheduleSlotId: string,
    bookingDate: string,
  ) => Promise<{ ok: boolean; message?: string; alumnaName?: string }>
}

export function BookByDisplayIdForm(props: Props) {
  const [state, formAction, pending] = useActionState(props.action, { success: false })
  const [displayId, setDisplayId] = useState("")
  const [scheduleSlotId, setScheduleSlotId] = useState("")
  const [bookingDate, setBookingDate] = useState(() =>
    resolveBookingDefaultDate(props.defaultDate, props.slots),
  )
  const [checkMessage, setCheckMessage] = useState<string | null>(null)
  const [checkOk, setCheckOk] = useState<boolean | null>(null)

  const dayOfWeek = getDayOfWeekFromDateStr(bookingDate)
  const slotsForDay = filterSlotsForBookingDate(props.slots, bookingDate)
  const nextDate = nextDateWithSlots(bookingDate, props.slots)
  const canUseNextDate =
    bookingDate !== "" &&
    slotsForDay.length === 0 &&
    nextDate !== bookingDate &&
    filterSlotsForBookingDate(props.slots, nextDate).length > 0
  const canSubmit =
    displayId.trim() !== "" &&
    bookingDate !== "" &&
    scheduleSlotId !== "" &&
    slotsForDay.length > 0

  useEffect(() => {
    if (!scheduleSlotId) return
    const valid = slotsForDay.some((s) => s.id === scheduleSlotId)
    if (!valid) {
      setScheduleSlotId("")
    }
  }, [bookingDate, slotsForDay, scheduleSlotId])

  useEffect(() => {
    if (state.success) return
    setBookingDate(resolveBookingDefaultDate(props.defaultDate, props.slots))
  }, [props.defaultDate, props.slots, state.success])

  useEffect(() => {
    if (state.success && state.message) {
      setCheckMessage(state.message)
      setCheckOk(true)
      if (props.onSuccess) {
        const savedDate = state.bookedDate ?? bookingDate
        if (savedDate) {
          props.onSuccess(savedDate)
        }
      }
    }
    if (state.error) {
      setCheckMessage(state.error)
      setCheckOk(false)
    }
  }, [state, props.onSuccess])

  useEffect(() => {
    if (!props.onCheckEligibility) return
    if (!displayId || !scheduleSlotId || !bookingDate) {
      setCheckMessage(null)
      setCheckOk(null)
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      props.onCheckEligibility!(displayId, scheduleSlotId, bookingDate).then((res) => {
        if (cancelled) return
        if (res.ok) {
          setCheckOk(true)
          setCheckMessage(
            res.alumnaName ? `Puedes reservar: ${res.alumnaName}` : "Horario disponible para este usuario",
          )
        } else {
          setCheckOk(false)
          setCheckMessage(res.message ?? "No se puede reservar este horario")
        }
      })
    }, 400)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [displayId, scheduleSlotId, bookingDate, props.onCheckEligibility])

  return (
    <>
      <DbActionSuccessEffect success={state.success} kind="create" />
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayId">ID de usuario (ST / STT)</Label>
        <Input
          id="displayId"
          name="displayId"
          value={displayId}
          onChange={(e) => setDisplayId(e.target.value.toUpperCase())}
          placeholder="ST0001"
          required
          className="font-mono uppercase"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bookingDate">Fecha de la clase</Label>
        <Input
          id="bookingDate"
          name="bookingDate"
          type="date"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="scheduleSlotId">Horario</Label>
        {bookingDate === "" ? (
          <p className="text-muted-foreground text-sm">Elige primero la fecha.</p>
        ) : slotsForDay.length === 0 ? (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {dayOfWeek === 0
                ? "No hay clases los domingos. Elige un día entre lunes y sábado."
                : "No hay clases ese día. Elige otra fecha o revisa el horario en Clases."}
            </p>
            {canUseNextDate ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBookingDate(nextDate)}
              >
                Usar {formatBookingDateEs(nextDate)}
              </Button>
            ) : null}
          </div>
        ) : (
          <select
            id="scheduleSlotId"
            name="scheduleSlotId"
            value={scheduleSlotId}
            onChange={(e) => setScheduleSlotId(e.target.value)}
            required
            className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Elige clase y hora</option>
            {slotsForDay.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {formatSlotLabel(slot)}
              </option>
            ))}
          </select>
        )}
      </div>
      {state.fieldErrors?.displayId ? (
        <p className="text-destructive text-sm">{state.fieldErrors.displayId[0]}</p>
      ) : null}
      {state.fieldErrors?.scheduleSlotId ? (
        <p className="text-destructive text-sm">{state.fieldErrors.scheduleSlotId[0]}</p>
      ) : null}
      {state.fieldErrors?.bookingDate ? (
        <p className="text-destructive text-sm">{state.fieldErrors.bookingDate[0]}</p>
      ) : null}
      {checkMessage ? (
        <p className={`text-sm ${checkOk ? "text-green-700" : "text-destructive"}`}>
          {checkMessage}
        </p>
      ) : null}
      {!canSubmit && bookingDate !== "" && slotsForDay.length === 0 ? null : !canSubmit ? (
        <p className="text-muted-foreground text-sm">Completa el ID, la fecha y el horario.</p>
      ) : null}
      <Button
        type="submit"
        className="w-full"
        disabled={pending || !canSubmit || checkOk === false}
      >
        {pending ? "Guardando..." : props.submitLabel}
      </Button>
    </form>
    </>
  )
}
