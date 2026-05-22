"use client"

import { useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import { PageHeader } from "@/components/features/admin/page-header"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/shared/ui/dialog"
import { Label } from "@/components/shared/ui/label"
import { Input } from "@/components/shared/ui/input"
import { Textarea } from "@/components/shared/ui/textarea"
import { Button } from "@/components/shared/ui/button"
import { useDbActionFeedback } from "@/components/features/admin/db-action-feedback"
import { ConfirmRemoveDialog } from "@/components/features/admin/confirm-remove-dialog"
import { createEventAction, deleteEventAction, updateEventAction } from "./actions"

import type { CalendarFeedEvent } from "./calendar-types"

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function toDatetimeLocal(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function CalendarClient(props: { events: CalendarFeedEvent[]; canManage: boolean }) {
  const { showDbActionFeedback } = useDbActionFeedback()
  const [eventsState] = useState(props.events)

  const [createOpen, setCreateOpen] = useState(false)
  const [createStart, setCreateStart] = useState("")
  const [createEnd, setCreateEnd] = useState("")

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailEvent, setDetailEvent] = useState<CalendarFeedEvent | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const hydrated = eventsState.map((e) => ({
    ...e,
    end: e.end ?? undefined,
    display: e.display,
    borderColor: e.borderColor,
    textColor: e.textColor,
    classNames: e.classNames,
    extendedProps: {
      ...(e.extendedProps ?? {}),
      raw: e,
    },
  }))

  function eventSourceFromOrderArg(value: unknown): string {
    if (value == null || typeof value !== "object") return ""
    const props = (value as { extendedProps?: { source?: string } }).extendedProps
    return props?.source ?? ""
  }

  function calendarEventOrder(a: unknown, b: unknown) {
    const order: Record<string, number> = {
      booking: 0,
      schedule: 1,
      birthday: 2,
      expiry: 3,
      studio: 4,
    }
    const as = eventSourceFromOrderArg(a)
    const bs = eventSourceFromOrderArg(b)
    return (order[as] ?? 9) - (order[bs] ?? 9)
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Calendario"
        description="Reservas confirmadas, alertas y horario de clases activo (desde Clases)"
      />

      <div data-tour="calendario-leyenda" className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2d6b4f]" />
          Reservas
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded border border-[#2f6b5f]/40 bg-[#2f6b5f]/10" />
          Horario sin reservas
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D4537E]" />
          Cumpleaños
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#BA7517]" />
          Vence plan
        </span>
      </div>

      <div data-tour="calendario-grid" className="admin-calendar rounded-lg border bg-card p-3 [&_.fc]:text-sm">
        <FullCalendar
          locale={esLocale}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          editable={false}
          selectable={props.canManage}
          events={hydrated}
          eventOrder={calendarEventOrder}
          height="auto"
          dayMaxEvents={8}
          moreLinkText={(n) => `+${n} más`}
          eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: false }}
          select={(info) => {
            if (!props.canManage) return
            setCreateStart(toDatetimeLocal(info.start))
            const end = new Date(info.end.getTime() - 60 * 1000)
            setCreateEnd(toDatetimeLocal(end))
            setCreateOpen(true)
          }}
          dateClick={(arg) => {
            if (!props.canManage) return
            const d = arg.date
            const start = new Date(d)
            start.setHours(9, 0, 0, 0)
            const end = new Date(start)
            end.setHours(10, 0, 0, 0)
            setCreateStart(toDatetimeLocal(start))
            setCreateEnd(toDatetimeLocal(end))
            setCreateOpen(true)
          }}
          eventClick={(clickInfo) => {
            clickInfo.jsEvent.preventDefault()
            const raw = clickInfo.event.extendedProps.raw as CalendarFeedEvent | undefined
            if (raw != null) {
              setDetailEvent(raw)
              setDetailOpen(true)
            }
          }}
        />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo evento</DialogTitle>
          </DialogHeader>
          <form
            action={async (fd) => {
              await createEventAction(fd)
              showDbActionFeedback("create")
              setCreateOpen(false)
              window.location.reload()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="ce-title">Título</Label>
              <Input id="ce-title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ce-description">Descripción</Label>
              <Textarea id="ce-description" name="description" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ce-type">Tipo</Label>
              <select
                id="ce-type"
                name="eventType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="general"
              >
                <option value="general">General</option>
                <option value="class">Clase</option>
                <option value="holiday">Festivo</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="birthday">Cumpleaños</option>
                <option value="expiry">Vencimiento</option>
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ce-start">Inicio</Label>
                <Input id="ce-start" name="start" type="datetime-local" required value={createStart} onChange={(e) => setCreateStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ce-end">Fin</Label>
                <Input id="ce-end" name="end" type="datetime-local" value={createEnd} onChange={(e) => setCreateEnd(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ce-allDay">Todo el día</Label>
              <select id="ce-allDay" name="allDay" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="false">
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ce-visible">Visible para</Label>
              <select id="ce-visible" name="visibleTo" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="admin">
                <option value="admin">Administración</option>
                <option value="coach">Coaches</option>
                <option value="all">Todos</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit">Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={(v) => { setDetailOpen(v); if (!v) setDetailEvent(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailEvent?.title ?? "Evento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="text-muted-foreground whitespace-pre-wrap">{detailEvent?.extendedProps?.description ?? ""}</div>
            <div className="text-muted-foreground">{detailEvent?.extendedProps?.eventType ?? ""}</div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setDetailOpen(false)}>
              Cerrar
            </Button>
            {props.canManage && detailEvent?.extendedProps?.source === "studio" ? (
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => { setEditOpen(true); setDetailOpen(false) }}>
                  Editar
                </Button>
                <Button type="button" variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
                  Eliminar
                </Button>
              </div>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setDetailEvent(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar evento</DialogTitle>
          </DialogHeader>
          {detailEvent != null && detailEvent.extendedProps?.source === "studio" ? (
            <form
              action={async (fd) => {
                await updateEventAction(fd)
                showDbActionFeedback("update")
                setEditOpen(false)
                setDetailEvent(null)
                window.location.reload()
              }}
              className="space-y-4"
            >
              <input type="hidden" name="id" value={detailEvent.id} />
              <div className="space-y-2">
                <Label htmlFor="ee-title">Título</Label>
                <Input id="ee-title" name="title" required defaultValue={detailEvent.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ee-description">Descripción</Label>
                <Textarea id="ee-description" name="description" rows={3} defaultValue={detailEvent.extendedProps?.description ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ee-type">Tipo</Label>
                <select
                  id="ee-type"
                  name="eventType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue={detailEvent.extendedProps?.eventType ?? "general"}
                >
                  <option value="general">General</option>
                  <option value="class">Clase</option>
                  <option value="holiday">Festivo</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="birthday">Cumpleaños</option>
                  <option value="expiry">Vencimiento</option>
                </select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ee-start">Inicio</Label>
                  <Input id="ee-start" name="start" type="datetime-local" required defaultValue={detailEvent.start.slice(0, 16)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ee-end">Fin</Label>
                  <Input id="ee-end" name="end" type="datetime-local" defaultValue={detailEvent.end != null && detailEvent.end !== "" ? detailEvent.end.slice(0, 16) : ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ee-allDay">Todo el día</Label>
                <select id="ee-allDay" name="allDay" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={detailEvent.allDay ? "true" : "false"}>
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ee-visible">Visible para</Label>
                <select id="ee-visible" name="visibleTo" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={detailEvent.extendedProps?.visibleTo ?? "admin"}>
                  <option value="admin">Administración</option>
                  <option value="coach">Coaches</option>
                  <option value="all">Todos</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmRemoveDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="¿Eliminar este evento?"
        description={`Se borrará "${detailEvent?.title ?? "este evento"}" del calendario. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        feedbackKind="delete"
        serverAction={async (fd) => {
          await deleteEventAction(fd)
          showDbActionFeedback("delete")
          setDetailOpen(false)
          window.location.reload()
        }}
        hiddenFields={[{ name: "id", value: detailEvent?.id ?? "" }]}
      />
    </div>
  )
}
