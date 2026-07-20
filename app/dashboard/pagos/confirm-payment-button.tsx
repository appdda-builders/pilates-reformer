"use client"

import { useState } from "react"
import { Button } from "@/components/shared/ui/button"
import { ConfirmRemoveDialog } from "@/components/features/admin/confirm-remove-dialog"
import { confirmPaymentAction } from "./actions"

export function ConfirmPaymentButton(props: {
  paymentId: string
  userName: string
  amountLabel: string
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
        Confirmar pago
      </Button>
      <ConfirmRemoveDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Confirmar este pago?"
        description={`Se marcará como cobrado el pago de ${props.userName} por ${props.amountLabel}. La alumna recibirá una notificación.`}
        confirmLabel="Sí, confirmar"
        confirmVariant="default"
        feedbackKind="update"
        serverAction={async (fd) => {
          const res = await confirmPaymentAction({ success: false }, fd)
          if (res.success) setOpen(false)
          return res
        }}
        hiddenFields={[{ name: "id", value: props.paymentId }]}
      />
    </>
  )
}
