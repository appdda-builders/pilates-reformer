"use server"

import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function restoreClassToSubscription(subscriptionId: string): Promise<void> {
  const db = getDb()

  const [sub] = await db
    .select({
      id: schema.subscription.id,
      isUnlimited: schema.subscription.isUnlimited,
      classesRemaining: schema.subscription.classesRemaining,
    })
    .from(schema.subscription)
    .where(eq(schema.subscription.id, subscriptionId))
    .limit(1)

  if (!sub) return
  if (sub.isUnlimited) return

  const current = sub.classesRemaining
  if (current == null) return

  await db
    .update(schema.subscription)
    .set({ classesRemaining: current + 1 })
    .where(eq(schema.subscription.id, subscriptionId))
}

export async function consumeClassFromSubscription(subscriptionId: string): Promise<void> {
  const db = getDb()

  const [sub] = await db
    .select({
      id: schema.subscription.id,
      isUnlimited: schema.subscription.isUnlimited,
      classesRemaining: schema.subscription.classesRemaining,
    })
    .from(schema.subscription)
    .where(eq(schema.subscription.id, subscriptionId))
    .limit(1)

  if (!sub) return

  if (sub.isUnlimited) return

  const current = sub.classesRemaining ?? 0
  if (current > 0) {
    await db
      .update(schema.subscription)
      .set({ classesRemaining: current - 1 })
      .where(eq(schema.subscription.id, subscriptionId))
  }
}
