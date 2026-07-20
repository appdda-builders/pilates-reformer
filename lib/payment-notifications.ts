import "server-only"

import type { AnyDb } from "@/lib/db"
import { interpolateMessage } from "@/lib/messages"
import { createNotification } from "@/lib/notifications"

const STUDIO_PAYMENT_TEMPLATE = `Hola {{nombre}}, ya no tienes clases disponibles en tu plan.

Por favor prepárate para hacer tu pago en el estudio, de ser necesario.`

const TRANSFER_PAYMENT_TEMPLATE = `Hola {{nombre}}, ya no tienes clases disponibles en tu plan.

Para renovar y seguir reservando, puedes hacer una transferencia:

Banco: Banco Azteca
Cuenta: 5263-5401-5974-3604
Titular: ADALBERTO RESENDIZ RAGEL
Concepto: Tu nombre completo`

export async function sendStudioPaymentNotification(
  db: AnyDb,
  params: { userId: string; nombre: string },
): Promise<void> {
  const body = interpolateMessage(STUDIO_PAYMENT_TEMPLATE, {
    nombre: params.nombre,
  })

  await createNotification(db, {
    userId: params.userId,
    type: "payment_studio",
    title: "Pago en el estudio",
    body,
  })
}

export async function sendTransferPaymentNotification(
  db: AnyDb,
  params: { userId: string; nombre: string },
): Promise<void> {
  const body = interpolateMessage(TRANSFER_PAYMENT_TEMPLATE, {
    nombre: params.nombre,
  })

  await createNotification(db, {
    userId: params.userId,
    type: "payment_transfer",
    title: "Datos para transferencia",
    body,
  })
}

const PAYMENT_CONFIRMED_TEMPLATE = `Hola {{nombre}}, confirmamos tu pago de {{monto}}.

Concepto: {{concepto}}
Método: {{metodo}}

¡Gracias! Ya quedó registrado en el estudio.`

export async function sendPaymentConfirmedNotification(
  db: AnyDb,
  params: {
    userId: string
    nombre: string
    amount: number
    method: string
    concept?: string | null
  },
): Promise<void> {
  const monto = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(params.amount)

  const body = interpolateMessage(PAYMENT_CONFIRMED_TEMPLATE, {
    nombre: params.nombre,
    monto,
    concepto: params.concept?.trim() || "Pago de plan",
    metodo: params.method,
  })

  await createNotification(db, {
    userId: params.userId,
    type: "payment_confirmed",
    title: "Pago confirmado",
    body,
  })
}
