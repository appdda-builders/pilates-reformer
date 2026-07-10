"use client"

import { useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { CircleCheck, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog"
import { DbActionSuccessEffect } from "@/components/features/admin/db-action-feedback"
import { authClient } from "@/lib/auth-client"
import { signInByDisplayId } from "@/lib/sign-in-by-display-id"
import {
  type BookingSlotOption,
  filterSlotsForBookingDate,
  formatBookingDateEs,
  formatSlotLabel,
  getDayOfWeekFromDateStr,
  nextDateWithSlots,
  resolveBookingDefaultDate,
} from "@/lib/booking-slot-options"
import {
  checkPublicBookingEligibility,
  createPublicBookingAction,
  loadAgendarDataAction,
  sendBookingPaymentNotificationAction,
  type AgendarData,
  type PublicBookingState,
} from "@/app/agendar/actions"
import { routes } from "@/lib/routes"

async function waitForSessionUser() {
  for (let i = 0; i < 40; i++) {
    const s = await authClient.getSession()
    if (s.data?.user != null) {
      return s.data.user
    }
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 150)
    })
  }
  return null
}

function AgendarBookingForm(props: {
  slots: BookingSlotOption[]
  defaultDate: string
  todayStr: string
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState<PublicBookingState, FormData>(
    createPublicBookingAction,
    { success: false },
  )
  const { data: sessionData } = authClient.useSession()
  const sessionUser = sessionData?.user ?? null

  const [scheduleSlotId, setScheduleSlotId] = useState("")
  const [bookingDate, setBookingDate] = useState(() =>
    resolveBookingDefaultDate(props.defaultDate, props.slots),
  )
  const [checkMessage, setCheckMessage] = useState<string | null>(null)
  const [checkOk, setCheckOk] = useState<boolean | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginDisplayId, setLoginDisplayId] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginPending, setLoginPending] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<{
    date: string
    slotId: string
    userName: string
  } | null>(null)
  const [noClasses, setNoClasses] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia" | null>(null)
  const [paymentNotifyPending, setPaymentNotifyPending] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)

  const dayOfWeek = getDayOfWeekFromDateStr(bookingDate)
  const slotsForDay = filterSlotsForBookingDate(props.slots, bookingDate)
  const nextDate = nextDateWithSlots(bookingDate, props.slots)
  const canUseNextDate =
    bookingDate !== "" &&
    slotsForDay.length === 0 &&
    nextDate !== bookingDate &&
    filterSlotsForBookingDate(props.slots, nextDate).length > 0
  const canSubmit =
    bookingDate !== "" && scheduleSlotId !== "" && slotsForDay.length > 0

  const isCurrentBookingConfirmed =
    confirmedBooking != null &&
    confirmedBooking.date === bookingDate &&
    confirmedBooking.slotId === scheduleSlotId

  const sessionDisplayIdRaw =
    sessionUser != null ? (sessionUser as { displayId?: string | null }).displayId : null
  const sessionDisplayId =
    typeof sessionDisplayIdRaw === "string" && sessionDisplayIdRaw.trim() !== ""
      ? sessionDisplayIdRaw
      : null

  useEffect(() => {
    if (!scheduleSlotId) return
    const valid = slotsForDay.some((s) => s.id === scheduleSlotId)
    if (!valid) {
      setScheduleSlotId("")
    }
  }, [bookingDate, slotsForDay, scheduleSlotId])

  useEffect(() => {
    if (state.success && state.message) {
      const confirmedName = state.message.replace(/, tu clase quedó confirmada\.$/, "")
      setCheckMessage(state.message)
      setCheckOk(true)
      setLoginOpen(false)
      setConfirmedBooking({
        date: state.bookedDate ?? bookingDate,
        slotId: scheduleSlotId,
        userName: confirmedName,
      })
    }
    if (state.error) {
      setCheckMessage(state.error)
      setCheckOk(false)
    }
  }, [state, bookingDate, scheduleSlotId])

  useEffect(() => {
    if (sessionUser == null) {
      setCheckMessage(null)
      setCheckOk(null)
      setNoClasses(false)
      setPaymentMethod(null)
      return
    }
    if (!scheduleSlotId || !bookingDate) {
      setCheckMessage(null)
      setCheckOk(null)
      setNoClasses(false)
      setPaymentMethod(null)
      return
    }
    if (isCurrentBookingConfirmed) {
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      checkPublicBookingEligibility(scheduleSlotId, bookingDate).then((res) => {
        if (cancelled) return
        if (res.ok) {
          setNoClasses(false)
          setPaymentMethod(null)
          setCheckOk(true)
          setCheckMessage(
            res.alumnaName ? `Puedes reservar: ${res.alumnaName}` : "Horario disponible",
          )
        } else {
          setNoClasses(res.noClasses === true)
          if (res.noClasses === true) {
            setPaymentMethod(null)
          }
          setCheckOk(false)
          setCheckMessage(res.message ?? "No se puede reservar este horario")
        }
      })
    }, 400)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [sessionUser, scheduleSlotId, bookingDate, isCurrentBookingConfirmed])

  async function submitBooking() {
    if (isCurrentBookingConfirmed) return
    if (bookingDate === "" || scheduleSlotId === "") return
    if (noClasses && paymentMethod == null) return
    const fd = new FormData()
    fd.set("bookingDate", bookingDate)
    fd.set("scheduleSlotId", scheduleSlotId)
    if (paymentMethod != null) {
      fd.set("paymentMethod", paymentMethod)
    }
    formAction(fd)
  }

  async function handlePaymentChoice(method: "efectivo" | "transferencia") {
    if (paymentNotifyPending) return
    setPaymentNotifyPending(true)
    setCheckMessage(null)
    setCheckOk(null)

    const res = await sendBookingPaymentNotificationAction(method)
    setPaymentNotifyPending(false)

    if (!res.ok) {
      setCheckOk(false)
      setCheckMessage(res.error ?? "No se pudo enviar la notificación")
      return
    }

    setPaymentMethod(method)
    setCheckOk(true)

    if (method === "efectivo") {
      setCheckMessage(
        "Te enviamos una notificación al panel. Prepárate para pagar en el estudio y confirma tu reserva.",
      )
      return
    }

    setCheckMessage(
      "Te enviamos los datos de transferencia al panel. Revisa tu notificación para pagar.",
    )
    setTransferModalOpen(true)
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginPending(true)

    const signIn = await signInByDisplayId(loginDisplayId, loginPassword)

    if (!signIn.ok) {
      setLoginPending(false)
      setLoginError(signIn.error)
      return
    }

    const user = await waitForSessionUser()
    if (user == null) {
      setLoginPending(false)
      setLoginError("Problemas de conexión. Vuelve a intentar.")
      return
    }

    const enabled = (user as { enabled?: boolean }).enabled
    if (enabled === false) {
      await authClient.signOut()
      setLoginPending(false)
      setLoginError("Tu cuenta está inhabilitada. Contacta al estudio.")
      return
    }

    setLoginPending(false)
    setLoginOpen(false)
    setLoginDisplayId("")
    setLoginPassword("")
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 400)
    })
    await submitBooking()
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isCurrentBookingConfirmed) return
    if (sessionUser == null) {
      setLoginOpen(true)
      return
    }
    void submitBooking()
  }

  return (
    <>
      <DbActionSuccessEffect success={state.success} kind="create" />
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {sessionUser != null ? (
          <div className="rounded-md border border-green-base/20 bg-green-base/5 px-4 py-3 text-sm">
            <p className="font-medium">{sessionUser.name}</p>
            {sessionDisplayId != null && sessionDisplayId !== "" ? (
              <p className="text-black/60 font-mono text-xs">{sessionDisplayId}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-black/60">
            Al confirmar, iniciarás sesión con tu ID y contraseña para identificar tu reserva.
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="bookingDate">Fecha de la clase</Label>
          <Input
            id="bookingDate"
            name="bookingDate"
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduleSlotId">Horario</Label>
          {bookingDate === "" ? (
            <p className="text-sm text-black/60">Elige primero la fecha.</p>
          ) : slotsForDay.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-black/60">
                {dayOfWeek === 0
                  ? "No hay clases los domingos. Elige un día entre lunes y sábado."
                  : "No hay clases ese día. Elige otra fecha."}
              </p>
              {canUseNextDate ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBookingDate(nextDate)}
                >
                  Usar {formatBookingDateEs(nextDate)}
                </Button>
              ) : null}
            </div>
          ) : (
            <select
              id="scheduleSlotId"
              name="scheduleSlotId"
              value={scheduleSlotId}
              onChange={(e) => setScheduleSlotId(e.target.value)}
              required
              className="flex h-10 w-full rounded-inner border border-black/10 bg-white px-3 py-2 text-sm"
            >
              <option value="">Elige clase y hora</option>
              {slotsForDay.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {formatSlotLabel(slot)}
                </option>
              ))}
            </select>
          )}
        </div>
        {isCurrentBookingConfirmed ? (
          <p className="text-sm">
            <span className="font-semibold text-[#1b1a18]">
              {confirmedBooking?.userName ?? sessionUser?.name ?? "Tu nombre"}
            </span>
            <span className="text-green-700">, tu clase quedó confirmada.</span>
          </p>
        ) : noClasses && sessionUser != null && scheduleSlotId !== "" ? (
          <div className="space-y-3 rounded-inner border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p>{checkMessage}</p>
            <p className="font-medium">Elige cómo quieres pagar para continuar con tu reserva:</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant={paymentMethod === "efectivo" ? "default" : "outline"}
                size="sm"
                disabled={paymentNotifyPending}
                onClick={() => void handlePaymentChoice("efectivo")}
              >
                {paymentNotifyPending && paymentMethod == null
                  ? "Enviando..."
                  : "Pago en efectivo en el estudio"}
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "transferencia" ? "default" : "outline"}
                size="sm"
                disabled={paymentNotifyPending}
                onClick={() => void handlePaymentChoice("transferencia")}
              >
                {paymentNotifyPending && paymentMethod == null
                  ? "Enviando..."
                  : "Transferencia"}
              </Button>
            </div>
            {paymentMethod === "efectivo" && checkMessage ? (
              <p className="text-green-800">{checkMessage}</p>
            ) : null}
            {paymentMethod === "transferencia" && checkMessage ? (
              <div className="space-y-2">
                <p className="text-green-800">{checkMessage}</p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-green-900"
                  onClick={() => setTransferModalOpen(true)}
                >
                  Ver datos de transferencia
                </Button>
              </div>
            ) : null}
          </div>
        ) : checkMessage ? (
          <p className={`text-sm ${checkOk ? "text-green-700" : "text-red-600"}`}>
            {checkMessage}
          </p>
        ) : null}
        {!isCurrentBookingConfirmed && !canSubmit && bookingDate !== "" && slotsForDay.length === 0 ? null : !isCurrentBookingConfirmed && !canSubmit ? (
          <p className="text-sm text-black/60">Completa la fecha y el horario.</p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            className="w-full gap-2 bg-green-base hover:bg-green-hover"
            disabled={
              isCurrentBookingConfirmed ||
              pending ||
              !canSubmit ||
              (sessionUser != null && checkOk === false && !noClasses) ||
              (noClasses && paymentMethod !== "efectivo")
            }
          >
            {isCurrentBookingConfirmed ? (
              <>
                <CircleCheck className="h-4 w-4" />
                Clase confirmada
              </>
            ) : pending ? (
              "Guardando..."
            ) : (
              "Confirmar reserva"
            )}
          </Button>
          {isCurrentBookingConfirmed ? (
            <Button type="button" variant="outline" className="w-full" onClick={props.onClose}>
              Cerrar
            </Button>
          ) : null}
        </div>
      </form>

      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Datos para transferencia</DialogTitle>
            <DialogDescription>
              Realiza tu pago con estos datos. En el concepto coloca tu nombre completo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-black/80">
            <p>Banco: Banco Azteca</p>
            <p>Cuenta: 5263-5401-5974-3604</p>
            <p>Titular: ADALBERTO RESENDIZ RAGEL</p>
            <p>Concepto: Tu nombre completo</p>
          </div>
          <Button type="button" className="w-full" onClick={() => setTransferModalOpen(false)}>
            Entendido
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Inicia sesión para reservar</DialogTitle>
            <DialogDescription>
              Usa tu ID de usuario (ST) y la contraseña que elegiste al registrarte.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
            <div className="space-y-2">
              <Label htmlFor="agendar-login-displayId">ID de usuario</Label>
              <Input
                id="agendar-login-displayId"
                type="text"
                autoComplete="username"
                value={loginDisplayId}
                onChange={(e) => setLoginDisplayId(e.target.value.toUpperCase())}
                required
                disabled={loginPending}
                className="font-mono uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agendar-login-password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="agendar-login-password"
                  type={loginPasswordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={loginPending}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setLoginPasswordVisible(!loginPasswordVisible)}
                  className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={loginPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                  disabled={loginPending}
                >
                  {loginPasswordVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-green-base hover:bg-green-hover" disabled={loginPending}>
              {loginPending ? "Ingresando..." : "Iniciar sesión y confirmar"}
            </Button>
            <p className="text-center text-xs text-black/60">
              ¿Aún no tienes cuenta?{" "}
              <Link href={routes.registry} className="text-green-base underline underline-offset-4">
                Regístrate aquí
              </Link>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function AgendarBookingModal(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [data, setData] = useState<AgendarData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!props.open) return
    if (data != null) return
    setLoading(true)
    setLoadError(null)
    loadAgendarDataAction()
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch(() => {
        setLoadError("No se pudo cargar el horario. Intenta de nuevo.")
        setLoading(false)
      })
  }, [props.open, data])

  function handleClose() {
    props.onOpenChange(false)
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Agendar clase</DialogTitle>
          <DialogDescription>
            Elige fecha y horario. Los planes son mensuales y las clases no son acumulables.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="py-8 text-center text-sm text-black/60">Cargando horarios...</p>
        ) : loadError ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-red-600">{loadError}</p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setData(null)
                setLoadError(null)
              }}
            >
              Reintentar
            </Button>
          </div>
        ) : data != null ? (
          <AgendarBookingForm
            slots={data.slots}
            defaultDate={data.defaultDate}
            todayStr={data.todayStr}
            onClose={handleClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
