"use client"

import { useCallback, useState } from "react"
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
  const router = useRouter()

  const handleSuccess = useCallback(
    function handleSuccess(bookedDate: string) {
      setOpen(false)
      router.push(`/dashboard/reservas?date=${bookedDate}`)
      router.refresh()
    },
    [router],
  )

  async function checkEligibility(
    displayId: string,
    scheduleSlotId: string,
    bookingDate: string,
  ) {
    const res = await checkBookingEligibilityAction(displayId, scheduleSlotId, bookingDate)
    return res
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <BookByDisplayIdForm
          key={props.defaultDate}
          slots={props.slots}
          defaultDate={props.defaultDate}
          disabledSlotDateKeys={props.disabledSlotDateKeys}
          submitLabel="Guardar reserva"
          action={createBookingAction}
          onCheckEligibility={checkEligibility}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
