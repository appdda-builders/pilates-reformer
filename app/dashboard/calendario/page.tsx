export const dynamic = "force-dynamic"

import { PageHeader } from "@/components/features/admin/page-header"

export default function CalendarioPage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Calendario" description="Vista de eventos del estudio" />
      <div className="text-sm text-muted-foreground">
        Módulo de calendario — requiere configuración de FullCalendar con datos del servidor.
      </div>
    </div>
  )
}
