"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import { ConfirmRemoveDialog } from "@/components/features/admin/confirm-remove-dialog"
import { useDbActionFeedback } from "@/components/features/admin/db-action-feedback"
import { toast } from "@/lib/hooks/use-toast"

export function CancelIconConfirm(props: {
  action: (formData: FormData) => Promise<{ success?: boolean; error?: string } | void>
  hiddenFields: { name: string; value: string }[]
  title: string
  description: string
  confirmLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { showDbActionFeedback } = useDbActionFeedback()

  async function handleConfirm(formData: FormData) {
    const result = await props.action(formData)
    if (result != null && typeof result === "object" && result.success === false) {
      if (result.error) {
        toast({
          variant: "destructive",
          title: "No se pudo cancelar",
          description: result.error,
        })
      }
      return
    }
    showDbActionFeedback("update")
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Cancelar</span>
      </Button>
      <ConfirmRemoveDialog
        open={open}
        onOpenChange={setOpen}
        title={props.title}
        description={props.description}
        confirmLabel={props.confirmLabel ?? "Sí, cancelar"}
        clientFormAction={handleConfirm}
        hiddenFields={props.hiddenFields}
        feedbackKind="update"
      />
    </>
  )
}
