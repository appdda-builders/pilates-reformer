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
): Promise<string | null> {
  const raw = identifierRaw.trim()
  if (raw === "") {
    return null
  }

  const db = getDb()

  if (raw.includes("@")) {
    const email = raw.toLowerCase()
    const [row] = await db
      .select({ email: schema.user.email })
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1)
    return row?.email?.trim() ?? null
  }

  const byDisplayId = await findUserByDisplayId(db, raw)
  if (byDisplayId != null) {
    const [row] = await db
      .select({ email: schema.user.email })
      .from(schema.user)
      .where(eq(schema.user.id, byDisplayId.id))
      .limit(1)
    return row?.email?.trim() ?? null
  }

  return null
}

export async function signInByDisplayId(
  identifierRaw: string,
  password: string,
): Promise<SignInByDisplayIdResult> {
  if (identifierRaw.trim() === "" || password === "") {
    return { ok: false, error: "ID o contraseña incorrectos" }
  }

  const email = await resolveEmailForLogin(identifierRaw)
  if (email == null || email === "") {
    return { ok: false, error: "ID o contraseña incorrectos" }
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
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
