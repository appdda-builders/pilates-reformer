import type { AnyDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { and, desc, eq, sql } from "drizzle-orm"

export async function createNotification(
  db: AnyDb,
  payload: {
    userId: string
    type: string
    title: string
    body: string
  },
): Promise<void> {
  await db.insert(schema.notification).values({
    id: crypto.randomUUID(),
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    isRead: false,
    createdAt: new Date(),
  })
}

export async function markNotificationsRead(db: AnyDb, userId: string): Promise<void> {
  await db
    .update(schema.notification)
    .set({ isRead: true })
    .where(eq(schema.notification.userId, userId))
}

export async function getUnreadNotifications(db: AnyDb, userId: string) {
  return db
    .select()
    .from(schema.notification)
    .where(
      and(eq(schema.notification.userId, userId), eq(schema.notification.isRead, false)),
    )
    .orderBy(desc(schema.notification.createdAt))
}

export async function countUnreadNotifications(db: AnyDb, userId: string): Promise<number> {
  const [row] = await db
    .select({ c: sql<number>`count(*)` })
    .from(schema.notification)
    .where(
      and(eq(schema.notification.userId, userId), eq(schema.notification.isRead, false)),
    )
  return Number(row?.c ?? 0)
}

export async function listRecentNotifications(db: AnyDb, userId: string, limit: number) {
  return db
    .select()
    .from(schema.notification)
    .where(eq(schema.notification.userId, userId))
    .orderBy(desc(schema.notification.createdAt))
    .limit(limit)
}
