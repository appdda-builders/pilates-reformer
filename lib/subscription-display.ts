export function subscriptionEndDate(endDate: Date | number): Date {
  return endDate instanceof Date ? endDate : new Date(endDate)
}

export function isSubscriptionCurrent(
  status: string,
  endDate: Date | number,
  now: Date = new Date(),
): boolean {
  return status === "active" && subscriptionEndDate(endDate) >= now
}

export function isSubscriptionRenewable(
  status: string,
  endDate: Date | number,
  now: Date = new Date(),
): boolean {
  return status === "active" && subscriptionEndDate(endDate) < now
}

export function pickPrimarySubscription<
  T extends { userId: string; status: string; endDate: Date | number },
>(rows: T[], now: Date = new Date()): T | null {
  let current: T | null = null
  let currentEnd = -1
  let renewable: T | null = null
  let renewableEnd = -1
  let latest: T | null = null
  let latestEnd = -1

  for (const row of rows) {
    const end = subscriptionEndDate(row.endDate).getTime()
    if (isSubscriptionCurrent(row.status, row.endDate, now)) {
      if (end > currentEnd) {
        current = row
        currentEnd = end
      }
    }
    if (isSubscriptionRenewable(row.status, row.endDate, now)) {
      if (end > renewableEnd) {
        renewable = row
        renewableEnd = end
      }
    }
    if (end > latestEnd) {
      latest = row
      latestEnd = end
    }
  }

  if (current != null) return current
  if (renewable != null) return renewable
  return latest
}

export function filterPrimarySubscriptionsPerUser<
  T extends { id: string; userId: string; status: string; endDate: Date | number },
>(rows: T[], now: Date = new Date()): T[] {
  const byUser = new Map<string, T[]>()
  for (const row of rows) {
    const list = byUser.get(row.userId) ?? []
    list.push(row)
    byUser.set(row.userId, list)
  }

  const picked: T[] = []
  for (const userRows of byUser.values()) {
    const primary = pickPrimarySubscription(userRows, now)
    if (primary != null) picked.push(primary)
  }

  const order = new Map(rows.map((r, i) => [r.id, i]))
  picked.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
  return picked
}
