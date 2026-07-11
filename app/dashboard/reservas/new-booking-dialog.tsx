"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shared/ui/dialog"
import { BookByDisplayIdForm } from "@/components/features/booking/book-by-display-id-form"
import type { BookingSlotOption } from "@/lib/booking-slot-options"
import {
  createBookingAction,
  checkBookingEligibilityAction,
} from "./actions"

export function NewBookingDialog(props: {
  slots: BookingSlotOption[]
  defaultDate: string
  disabledSlotDateKeys?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null)
  const router = useRouter()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setConfirmedMessage(null)
      setFormKey((k) => k + 1)
    }
  }

  function handleSuccess(bookedDate: string, message?: string) {
    setConfirmedMessage(message ?? "Reserva confirmada")
    window.setTimeout(() => {
      setOpen(false)
      setConfirmedMessage(null)
      setFormKey((k) => k + 1)
      router.push(`/dashboard/reservas?date=${encodeURIComponent(bookedDate)}`)
      router.refresh()
    }, 900)
  }

  async function checkEligibility(
    displayId: string,
    scheduleSlotId: string,
    bookingDate: string,
  ) {
    const res = await checkBookingEligibilityAction(displayId, scheduleSlotId, bookingDate)
    return res
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Reserva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva reserva</DialogTitle>
        </DialogHeader>
        {confirmedMessage != null ? (
          <div className="space-y-3 py-2">
            <p className="text-sm text-green-700 font-medium">{confirmedMessage}</p>
            <p className="text-sm text-muted-foreground">Redirigiendo a la agenda del día...</p>
          </div>
        ) : (
          <BookByDisplayIdForm
            key={formKey}
            slots={props.slots}
            defaultDate={props.defaultDate}
            disabledSlotDateKeys={props.disabledSlotDateKeys}
            submitLabel="Confirmar reserva"
            action={createBookingAction}
            onCheckEligibility={checkEligibility}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
