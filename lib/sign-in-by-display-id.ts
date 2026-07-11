"use server"

import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { findUserByDisplayId } from "@/lib/booking-service"

export type SignInByDisplayIdResult =
  | { ok: true }
  | { ok: false; error: string }

async function resolveEmailForLogin(
  identifierRaw: string,
): Promise<{ email: string | null; disabled: boolean }> {
  const raw = identifierRaw.trim()
  if (raw === "") {
    return { email: null, disabled: false }
  }

  const db = getDb()

  if (raw.includes("@")) {
    const email = raw.toLowerCase()
    const [row] = await db
      .select({ email: schema.user.email, enabled: schema.user.enabled })
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1)
    if (row == null) {
      return { email: null, disabled: false }
    }
    if (row.enabled === false) {
      return { email: null, disabled: true }
    }
    return { email: row.email.trim(), disabled: false }
  }

  const byDisplayId = await findUserByDisplayId(db, raw)
  if (byDisplayId == null) {
    return { email: null, disabled: false }
  }

  const [row] = await db
    .select({ email: schema.user.email, enabled: schema.user.enabled })
    .from(schema.user)
    .where(eq(schema.user.id, byDisplayId.id))
    .limit(1)

  if (row == null) {
    return { email: null, disabled: false }
  }
  if (row.enabled === false) {
    return { email: null, disabled: true }
  }
  return { email: row.email.trim(), disabled: false }
}

export async function signInByDisplayId(
  identifierRaw: string,
  password: string,
): Promise<SignInByDisplayIdResult> {
  if (identifierRaw.trim() === "" || password === "") {
    return { ok: false, error: "ID o contraseña incorrectos" }
  }

  const resolved = await resolveEmailForLogin(identifierRaw)
  if (resolved.disabled) {
    return { ok: false, error: "Tu cuenta está inhabilitada. Contacta al estudio." }
  }
  if (resolved.email == null || resolved.email === "") {
    return { ok: false, error: "ID o contraseña incorrectos" }
  }

  try {
    await auth.api.signInEmail({
      body: { email: resolved.email, password },
      headers: await headers(),
    })
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ""
    if (msg.toLowerCase().includes("inhabilitad")) {
      return { ok: false, error: "Tu cuenta está inhabilitada. Contacta al estudio." }
    }
    return { ok: false, error: "ID o contraseña incorrectos" }
  }
}
