"use client"

import { CancelIconConfirm } from "@/components/features/admin/cancel-icon-confirm"
import { cancelBookingDirect } from "./actions"

export function CancelBookingButton(props: {
  bookingId: string
  userName: string
  mode?: "admin" | "self"
}) {
  const isSelf = props.mode === "self"

  return (
    <CancelIconConfirm
      action={cancelBookingDirect}
      hiddenFields={[{ name: "id", value: props.bookingId }]}
      title={isSelf ? "¿Liberar este horario?" : "¿Cancelar esta reserva?"}
      description={
        isSelf
          ? "Tu plaza quedará disponible para otra persona."
          : `Se cancelará la reserva de ${props.userName}. La plaza quedará disponible.`
      }
      confirmLabel={isSelf ? "Sí, liberar" : "Sí, cancelar"}
    />
  )
}
