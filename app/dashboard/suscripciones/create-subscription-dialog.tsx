"use client"

import { useActionState, useState, useEffect } from "react"
import { Button } from "@/components/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shared/ui/dialog"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select"
import { Plus } from "lucide-react"
import { DbActionSuccessEffect } from "@/components/features/admin/db-action-feedback"
import { formatPlanPickerLabel, formatPublicPlanPrice } from "@/lib/site/plans"
import { createSubscriptionAction, type ActionState } from "./actions"

type Alumno = { id: string; name: string }
type Plan = {
  id: string
  name: string
  priceMxn: number
  totalClasses: number | null
  planType: string
}

const DISCOUNT_OPTIONS = [
  { value: "none", label: "Sin descuento", pct: 0 },
  { value: "inauguracion_0.20", label: "20% De inauguración", pct: 0.20, reason: "inauguracion" },
  { value: "evento_0.10", label: "10% Evento especial", pct: 0.10, reason: "evento_especial" },
  { value: "efectivo_referido_0.05", label: "5% pago en efectivo o referido", pct: 0.05, reason: "efectivo_referido" },
]

const BILLING_CYCLE_OPTIONS = [
  { value: "mensual", label: "Mensual" },
  { value: "quincenal", label: "Quincenal" },
  { value: "semanal", label: "Semanal" },
  { value: "efectivo", label: "Efectivo" },
]

const initial: ActionState = { success: false }

export function CreateSubscriptionDialog({
  alumnos,
  planes,
}: {
  alumnos: Alumno[]
  planes: Plan[]
}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createSubscriptionAction, initial)
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [selectedDiscount, setSelectedDiscount] = useState("none")

  const selectedPlan = planes.find((p) => p.id === selectedPlanId)
  const discountOption = DISCOUNT_OPTIONS.find((d) => d.value === selectedDiscount)
  const discountPct = discountOption?.pct ?? 0
  const finalPrice =
    selectedPlan != null
      ? selectedPlan.priceMxn * (1 - discountPct)
      : null

  useEffect(() => {
    if (state.success) setOpen(false)
  }, [state.success])

  return (
    <>
      <DbActionSuccessEffect success={state.success} kind="create" />
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Activar Suscripción
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Suscripción</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="userId">Usuario</Label>
            <Select name="userId" required>
              <SelectTrigger id="userId" className="w-full">
                <SelectValue placeholder="Seleccionar usuario" />
              </SelectTrigger>
              <SelectContent>
                {alumnos.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors?.userId && (
              <p className="text-xs text-destructive">{state.fieldErrors.userId[0]}</p>
            )}
          </div>

          {/* Plan */}
          <div className="space-y-1.5">
            <Label htmlFor="planId">Plan</Label>
            <Select
              name="planId"
              required
              onValueChange={(v) => { setSelectedPlanId(v); setSelectedDiscount("none") }}
            >
              <SelectTrigger id="planId" className="w-full">
                <SelectValue placeholder="Seleccionar plan" />
              </SelectTrigger>
              <SelectContent>
                {planes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {formatPlanPickerLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha inicio */}
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Fecha de inicio</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>

          {/* Ciclo de pago */}
          <div className="space-y-1.5">
            <Label htmlFor="billingCycle">Ciclo de pago</Label>
            <Select name="billingCycle" defaultValue="mensual">
              <SelectTrigger id="billingCycle" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BILLING_CYCLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descuento */}
          <div className="space-y-1.5">
            <Label htmlFor="discount">Descuento</Label>
            <Select
              value={selectedDiscount}
              onValueChange={setSelectedDiscount}
            >
              <SelectTrigger id="discount" className="w-full">
                <SelectValue placeholder="Sin descuento" />
              </SelectTrigger>
              <SelectContent>
                {DISCOUNT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Hidden fields for discount values */}
            {discountOption?.pct ? (
              <>
                <input type="hidden" name="discountPct" value={discountOption.pct} />
                <input type="hidden" name="discountReason" value={discountOption.reason} />
              </>
            ) : null}
          </div>

          {/* Precio final preview */}
          {finalPrice != null ? (
            <div className="rounded-md bg-muted px-3 py-2 text-sm">
              <span className="text-muted-foreground">Precio final: </span>
              <span className="font-semibold text-foreground">
                {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(finalPrice)}
              </span>
              {discountPct > 0 && selectedPlan ? (
                <span className="ml-2 text-muted-foreground line-through text-xs">
                  {formatPublicPlanPrice(selectedPlan.planType, selectedPlan.priceMxn)}
                </span>
              ) : null}
            </div>
          ) : null}

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Guardando..." : "Activar Suscripción"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
