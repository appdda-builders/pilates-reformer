"use client"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shared/ui/alert-dialog"
import { Button } from "@/components/shared/ui/button"
import { DbActionForm } from "@/components/features/admin/db-action-form"
import type { DbActionKind } from "@/components/features/admin/db-action-feedback"

export function ConfirmRemoveDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  hiddenFields: { name: string; value: string }[]
  pending?: boolean
  feedbackKind?: DbActionKind
  confirmVariant?: "default" | "destructive"
  serverAction?: (formData: FormData) => Promise<{ success?: boolean; error?: string } | void>
  clientFormAction?: (formData: FormData) => void
}) {
  const feedbackKind = props.feedbackKind ?? "update"
  const confirmVariant = props.confirmVariant ?? "destructive"

  const fields = props.hiddenFields.map((field) => (
    <input key={field.name} type="hidden" name={field.name} value={field.value} />
  ))

  const submitButton = (
    <Button type="submit" variant={confirmVariant} disabled={props.pending}>
      {props.pending ? "Procesando..." : props.confirmLabel}
    </Button>
  )

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription>{props.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" disabled={props.pending}>
            {props.cancelLabel ?? "No, volver"}
          </AlertDialogCancel>
          {props.serverAction ? (
            <DbActionForm action={props.serverAction} kind={feedbackKind} className="flex flex-row flex-wrap justify-end gap-2">
              {fields}
              {submitButton}
            </DbActionForm>
          ) : (
            <form action={props.clientFormAction} className="inline">
              {fields}
              {submitButton}
            </form>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
