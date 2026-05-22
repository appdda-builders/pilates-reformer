"use client"

import { CancelIconConfirm } from "@/components/features/admin/cancel-icon-confirm"
import { cancelBookingDirect } from "./actions"

export function CancelBookingButton(props: { bookingId: string; userName: string }) {
  return (
    <CancelIconConfirm
      action={cancelBookingDirect}
      hiddenFields={[{ name: "id", value: props.bookingId }]}
      title="¿Cancelar esta reserva?"
      description={`Se cancelará la reserva de ${props.userName}. La plaza quedará disponible.`}
    />
  )
}
