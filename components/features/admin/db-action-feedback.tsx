"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { Check, Pencil, Trash2 } from "lucide-react"

export type DbActionKind = "create" | "update" | "delete"

type DbActionFeedbackContextValue = {
  showDbActionFeedback: (kind: DbActionKind) => void
  activeKind: DbActionKind | null
  fading: boolean
}

const DbActionFeedbackContext = createContext<DbActionFeedbackContextValue | null>(null)

export function DbActionFeedbackProvider(props: { children: React.ReactNode }) {
  const [activeKind, setActiveKind] = useState<DbActionKind | null>(null)
  const [fading, setFading] = useState(false)
  const [tick, setTick] = useState(0)

  function showDbActionFeedback(kind: DbActionKind) {
    setFading(false)
    setActiveKind(kind)
    setTick((n) => n + 1)
  }

  useEffect(() => {
    if (activeKind === null) return
    const fadeTimer = window.setTimeout(() => setFading(true), 5000)
    const hideTimer = window.setTimeout(() => {
      setActiveKind(null)
      setFading(false)
    }, 5500)
    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [activeKind, tick])

  return (
    <DbActionFeedbackContext.Provider
      value={{ showDbActionFeedback, activeKind, fading }}
    >
      {props.children}
    </DbActionFeedbackContext.Provider>
  )
}

export function useDbActionFeedback() {
  const ctx = useContext(DbActionFeedbackContext)
  if (ctx === null) {
    throw new Error("useDbActionFeedback debe usarse dentro de DbActionFeedbackProvider")
  }
  return ctx
}

export function DbActionSuccessEffect(props: {
  success: boolean
  kind: DbActionKind
}) {
  const ctx = useContext(DbActionFeedbackContext)
  const seen = useRef(false)

  useEffect(() => {
    if (ctx == null) return
    if (props.success && !seen.current) {
      ctx.showDbActionFeedback(props.kind)
      seen.current = true
    }
    if (!props.success) {
      seen.current = false
    }
  }, [props.success, props.kind, ctx])

  return null
}

export function bindDbAction<T extends { success?: boolean }>(
  action: (prev: T, formData: FormData) => Promise<T>,
  kind: DbActionKind,
  show: (kind: DbActionKind) => void,
) {
  return async (prev: T, formData: FormData): Promise<T> => {
    const result = await action(prev, formData)
    if (result.success) {
      show(kind)
    }
    return result
  }
}

function badgeStyles(kind: DbActionKind) {
  if (kind === "create") {
    return "bg-green-100 text-green-700 border-green-200"
  }
  if (kind === "delete") {
    return "bg-red-100 text-red-700 border-red-200"
  }
  return "bg-blue-100 text-blue-700 border-blue-200"
}

export function DbActionFeedbackBadge() {
  const { activeKind, fading } = useDbActionFeedback()

  if (activeKind === null) {
    return null
  }

  const styles = badgeStyles(activeKind)

  return (
    <span
      aria-hidden
      className={`pointer-events-none flex h-9 w-9 items-center justify-center rounded-full border transition-opacity duration-500 ${styles} ${fading ? "opacity-0" : "opacity-100"}`}
    >
      {activeKind === "create" ? (
        <Check className="h-4 w-4" strokeWidth={2.5} />
      ) : null}
      {activeKind === "update" ? (
        <Pencil className="h-4 w-4" strokeWidth={2.5} />
      ) : null}
      {activeKind === "delete" ? (
        <Trash2 className="h-4 w-4" strokeWidth={2.5} />
      ) : null}
    </span>
  )
}
