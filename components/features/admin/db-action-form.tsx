"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDbActionFeedback, type DbActionKind } from "@/components/features/admin/db-action-feedback"
import { cn } from "@/lib/utils"

type ActionResult = { success?: boolean; error?: string } | void

export function DbActionForm(props: {
  action: (formData: FormData) => Promise<ActionResult>
  kind: DbActionKind
  children: React.ReactNode
  className?: string
}) {
  const { showDbActionFeedback } = useDbActionFeedback()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleAction(formData: FormData) {
    setError(null)
    setPending(true)
    try {
      const result = await props.action(formData)
      if (result != null && typeof result === "object" && "success" in result) {
        if (result.success) {
          showDbActionFeedback(props.kind)
          router.refresh()
        } else {
          setError(result.error ?? "No se pudo guardar")
        }
        return
      }
      showDbActionFeedback(props.kind)
      router.refresh()
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form action={handleAction} className="flex min-w-0 flex-col gap-2">
      {error ? (
        <p className="w-full min-w-0 text-right text-sm text-destructive">{error}</p>
      ) : null}
      <div
        className={cn(
          pending && "pointer-events-none opacity-60",
          props.className,
        )}
      >
        {props.children}
      </div>
    </form>
  )
}
