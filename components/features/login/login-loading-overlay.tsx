"use client"

import { useEffect, useRef } from "react"
import { Spinner } from "@/components/shared/ui/spinner"

const TIMEOUT_MS = 20000

export function LoginLoadingOverlay(props: {
  active: boolean
  onConnectionTimeout: () => void
}) {
  const activeRef = useRef(props.active)
  const timeoutRef = useRef(props.onConnectionTimeout)

  useEffect(() => {
    activeRef.current = props.active
  }, [props.active])

  useEffect(() => {
    timeoutRef.current = props.onConnectionTimeout
  }, [props.onConnectionTimeout])

  useEffect(() => {
    if (!props.active) {
      return
    }

    const timer = window.setTimeout(() => {
      if (activeRef.current) {
        timeoutRef.current()
      }
    }, TIMEOUT_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [props.active])

  if (!props.active) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background px-8">
      <Spinner className="size-10 text-primary" />
      <p className="text-center text-sm text-muted-foreground">Ingresando al panel...</p>
    </div>
  )
}
