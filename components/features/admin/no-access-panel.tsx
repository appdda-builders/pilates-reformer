"use client"

import { TrafficCone } from "lucide-react"
import { Button } from "@/components/shared/ui/button"

export function NoAccessPanel() {
  function handleNotifyAdmin() {
    const subject = encodeURIComponent("Solicitud de acceso al panel")
    const body = encodeURIComponent(
      "Hola, necesito que activen mis permisos de menú en el panel de administración (Configuración → Permisos).",
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-neutral-50 p-8 font-sans">
      <TrafficCone
        className="mb-10 h-32 w-32 text-neutral-200"
        strokeWidth={1.25}
        aria-hidden
      />

      <h1 className="max-w-md text-center text-3xl font-bold tracking-tight text-neutral-900">
        Sitio en mantenimiento
      </h1>

      <p className="mt-4 max-w-md text-center text-base font-normal leading-relaxed text-neutral-500">
        Estamos actualizando la información del sistema. En caso de que el acceso no se restablezca, favor de contactar soporte técnico.
      </p>
    </div>
  )
}
