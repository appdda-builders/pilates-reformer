export const dynamic = "force-dynamic"

import { PageHeader } from "@/components/features/admin/page-header"

export default function CoachSchedulePage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Mi Horario" description="Clases asignadas" />
      <p className="text-sm text-muted-foreground">Módulo en construcción.</p>
    </div>
  )
}
