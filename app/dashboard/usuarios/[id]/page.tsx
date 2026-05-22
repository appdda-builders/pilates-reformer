export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { PageHeader } from "@/components/features/admin/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card"
import { Badge } from "@/components/shared/ui/badge"

type Params = Promise<{ id: string }>

export default async function UsuarioDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const db = getDb()

  const [userRow] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, id))
    .limit(1)

  if (!userRow) notFound()

  const subscriptions = await db
    .select({
      id: schema.subscription.id,
      status: schema.subscription.status,
      startDate: schema.subscription.startDate,
      endDate: schema.subscription.endDate,
      classesRemaining: schema.subscription.classesRemaining,
      planId: schema.subscription.planId,
    })
    .from(schema.subscription)
    .where(eq(schema.subscription.userId, id))
    .orderBy(desc(schema.subscription.createdAt))
    .limit(5)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={userRow.name}
        description={userRow.email}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID</span>
              <span className="font-mono">{userRow.displayId ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rol</span>
              <Badge variant="outline">{userRow.role}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <Badge variant={userRow.enabled ? "default" : "secondary"}>
                {userRow.enabled ? "Activo" : "Inhabilitado"}
              </Badge>
            </div>
            {userRow.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teléfono</span>
                <span>{userRow.phone}</span>
              </div>
            )}
            {userRow.birthdate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cumpleaños</span>
                <span>{userRow.birthdate}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Suscripciones recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin suscripciones</p>
            ) : (
              subscriptions.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <Badge variant="outline" className="text-xs mr-2">{s.status}</Badge>
                    {s.classesRemaining != null && (
                      <span className="text-muted-foreground">{s.classesRemaining} clases</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(s.endDate instanceof Date ? s.endDate : new Date(s.endDate as unknown as number))
                      .toLocaleDateString("es-MX")}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
