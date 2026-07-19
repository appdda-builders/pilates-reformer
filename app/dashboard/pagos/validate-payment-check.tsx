"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/shared/ui/checkbox"
import { useDbActionFeedback } from "@/components/features/admin/db-action-feedback"
import { setPaymentValidatedAction } from "./actions"

export function ValidatePaymentCheck(props: {
  paymentId: string
  validated: boolean
}) {
  const router = useRouter()
  const { showDbActionFeedback } = useDbActionFeedback()
  const [checked, setChecked] = useState(props.validated)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setChecked(props.validated)
  }, [props.validated])

  async function handleChange(next: boolean) {
    if (pending) return
    const previous = checked
    setChecked(next)
    setPending(true)
    const fd = new FormData()
    fd.set("id", props.paymentId)
    fd.set("validated", next ? "true" : "false")
    const res = await setPaymentValidatedAction({ success: false }, fd)
    setPending(false)
    if (res.success) {
      showDbActionFeedback("update")
      router.refresh()
    } else {
      setChecked(previous)
    }
  }

  return (
    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
      <Checkbox
        checked={checked}
        disabled={pending}
        onCheckedChange={(value) => {
          void handleChange(value === true)
        }}
        aria-label={checked ? "Marcar como no validado" : "Marcar como validado"}
      />
      <span>{checked ? "Validado" : "Validar"}</span>
    </label>
  )
}
