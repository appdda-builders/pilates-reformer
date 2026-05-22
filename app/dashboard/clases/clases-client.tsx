"use client"

import { useActionState, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/features/admin/page-header"
import { Button } from "@/components/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shared/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/shared/ui/tabs"
import { DbActionSuccessEffect } from "@/components/features/admin/db-action-feedback"
import { createSlotAction, type ActionState } from "./actions"
import { SlotCard, type SlotCardData } from "./slot-card"
import { SlotFormFields, type CoachOption } from "./slot-form-fields"

const initial: ActionState = { success: false }

const CLASES_DAY_STORAGE_KEY = "pilates_clases_day"
const DEFAULT_DAY = "1"

const DAY_TABS = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
]

function isValidDayValue(value: string): boolean {
  return DAY_TABS.some((tab) => tab.value === value)
}

export function ClasesClient(props: {
  slots: SlotCardData[]
  activeCount: number
  coaches: CoachOption[]
  canManage: boolean
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState(DEFAULT_DAY)
  const [dayReady, setDayReady] = useState(false)
  const [createState, createAction, createPending] = useActionState(createSlotAction, initial)

  useEffect(() => {
    let next = DEFAULT_DAY
    try {
      const stored = window.localStorage.getItem(CLASES_DAY_STORAGE_KEY)
      if (stored != null && isValidDayValue(stored)) {
        next = stored
      }
    } catch {
      next = DEFAULT_DAY
    }
    setSelectedDay(next)
    setDayReady(true)
  }, [])

  useEffect(() => {
    if (!dayReady) return
    try {
      window.localStorage.setItem(CLASES_DAY_STORAGE_KEY, selectedDay)
    } catch {
    }
  }, [selectedDay, dayReady])

  useEffect(() => {
    if (createState.success) setCreateOpen(false)
  }, [createState.success])

  const dayNumber = Number(selectedDay)
  const daySlots = props.slots
    .filter((slot) => slot.dayOfWeek === dayNumber)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  const dayActiveCount = daySlots.filter((slot) => slot.isActive).length
  const selectedDayLabel = DAY_TABS.find((tab) => tab.value === selectedDay)?.label ?? ""

  if (!dayReady) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Clases"
          description={`${props.slots.length} en total · ${props.activeCount} activas`}
        />
      </div>
    )
  }

  return (
    <>
      <DbActionSuccessEffect success={createState.success} kind="create" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Clases"
          description={`${props.slots.length} en total · ${props.activeCount} activas`}
        >
          {props.canManage ? (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Clase
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nueva clase</DialogTitle>
                </DialogHeader>
                <form action={createAction} className="space-y-4">
                  <SlotFormFields
                    idPrefix="create"
                    coaches={props.coaches}
                    fieldErrors={createState.fieldErrors}
                  />
                  {createState.error ? (
                    <p className="text-destructive text-sm">{createState.error}</p>
                  ) : null}
                  <Button type="submit" className="w-full" disabled={createPending}>
                    Crear clase
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : null}
        </PageHeader>

        <Tabs value={selectedDay} onValueChange={setSelectedDay} className="space-y-4">
          <TabsList className="flex h-auto w-full flex-wrap gap-1 p-1 sm:w-fit">
            {DAY_TABS.map((tab) => {
              const count = props.slots.filter((slot) => slot.dayOfWeek === Number(tab.value)).length
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="px-3 py-1.5 text-sm">
                  {tab.label}
                  {count > 0 ? (
                    <span className="text-muted-foreground ml-1 text-xs">({count})</span>
                  ) : null}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <p className="text-sm text-muted-foreground">
            {selectedDayLabel}: {daySlots.length} clase{daySlots.length === 1 ? "" : "s"} ·{" "}
            {dayActiveCount} activa{dayActiveCount === 1 ? "" : "s"}
          </p>

          {daySlots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Sin clases el {selectedDayLabel.toLowerCase()}
            </p>
          ) : (
            <div
              data-tour="clases-grid"
              className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {daySlots.map((slot) => (
                <div key={slot.id} className="h-full">
                  <SlotCard slot={slot} coaches={props.coaches} canManage={props.canManage} compact />
                </div>
              ))}
            </div>
          )}
        </Tabs>
      </div>
    </>
  )
}
