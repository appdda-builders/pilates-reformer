"use client"

import { useState } from "react"
import { Button } from "@/components/shared/ui/button"
import { ConfirmRemoveDialog } from "@/components/features/admin/confirm-remove-dialog"
import { renewSubscriptionAction } from "./actions"

export function RenewSubscriptionButton(props: {
  subscriptionId: string
  userName: string
  planName: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-xs h-8 shrink-0"
        onClick={() => setOpen(true)}
      >
        Renovar
      </Button>
      <ConfirmRemoveDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Renovar suscripción?"
        description={`Se reinicia el periodo de ${props.planName} para ${props.userName}: nueva fecha de fin según el plan, clases al máximo del paquete y un pago pendiente con el precio actual del plan (mantiene el descuento guardado si había).`}
        confirmLabel="Renovar"
        confirmVariant="default"
        feedbackKind="update"
        serverAction={async (fd) => {
          const res = await renewSubscriptionAction({ success: false }, fd)
          if (res.success) setOpen(false)
          return res
        }}
        hiddenFields={[{ name: "id", value: props.subscriptionId }]}
      />
    </>
  )
}
