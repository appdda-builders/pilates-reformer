import { hashPassword } from "better-auth/crypto"
import { and, eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { generatePassword } from "@/lib/generate-password"
import { createNotification } from "@/lib/notifications"
import { revokeUserSessions } from "@/lib/revoke-user-sessions"

export async function resetUserPassword(userId: string): Promise<string> {
  const newPassword = generatePassword()
  const hashed = await hashPassword(newPassword)
  const db = getDb()

  const [userRow] = await db
    .select({ name: schema.user.name, displayId: schema.user.displayId })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .limit(1)

  const [credentialAccount] = await db
    .select({ id: schema.account.id })
    .from(schema.account)
    .where(
      and(
        eq(schema.account.userId, userId),
        eq(schema.account.providerId, "credential"),
      ),
    )
    .limit(1)

  if (credentialAccount == null) {
    throw new Error("Este usuario no tiene contraseña configurada")
  }

  await db
    .update(schema.account)
    .set({ password: hashed })
    .where(eq(schema.account.id, credentialAccount.id))

  await revokeUserSessions(db, userId)

  const userName = userRow?.name?.trim() ?? "Usuario"

  await createNotification(db, {
    userId,
    type: "password_reset",
    title: "Contraseña actualizada",
    body: `Hola ${userName}, tu contraseña del panel fue restablecida por el estudio. Usa la nueva contraseña que te compartieron para iniciar sesión.`,
  })

  return newPassword
}
