export const dynamic = "force-dynamic"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { PageHeader } from "@/components/features/admin/page-header"
import { Card, CardContent } from "@/components/shared/ui/card"

export default async function PoliticaPage() {
  const db = getDb()
  const [policy] = await db.select().from(schema.studioPolicy).limit(1)

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Política del Estudio" description="Mensaje de bienvenida y políticas" />

      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-3 text-sm">Mensaje de bienvenida</h2>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
            {policy?.welcomeMessage ?? "Sin mensaje configurado"}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
