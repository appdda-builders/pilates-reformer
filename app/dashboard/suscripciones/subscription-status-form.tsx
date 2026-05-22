"use client"

import { Button } from "@/components/shared/ui/button"
import { DbActionForm } from "@/components/features/admin/db-action-form"
import { setSubscriptionStatusAction } from "./actions"

export function SubscriptionStatusForm(props: {
  subscriptionId: string
  status: string
  label: string
  variant?: "default" | "outline" | "ghost"
  className?: string
}) {
  return (
    <DbActionForm action={setSubscriptionStatusAction} kind="update" className="inline-flex flex-row">
      <input type="hidden" name="id" value={props.subscriptionId} />
      <input type="hidden" name="status" value={props.status} />
      <Button type="submit" variant={props.variant ?? "outline"} size="sm" className={props.className}>
        {props.label}
      </Button>
    </DbActionForm>
  )
}
