export function toSubscriptionLocalDate(d: Date | string): Date {
  if (typeof d === "string") {
    const trimmed = d.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return new Date(`${trimmed}T12:00:00`)
    }
    const parsed = new Date(d)
    parsed.setHours(12, 0, 0, 0)
    return parsed
  }
  const copy = new Date(d)
  copy.setHours(12, 0, 0, 0)
  return copy
}

export function subscriptionEndOfDay(d: Date | number): Date {
  const end = d instanceof Date ? new Date(d) : new Date(d)
  end.setHours(23, 59, 59, 999)
  return end
}

export function computeSubscriptionEndDate(startDate: Date, durationDays: number): Date {
  const start = toSubscriptionLocalDate(startDate)
  const end = new Date(start)
  if (durationDays === 30) {
    end.setMonth(end.getMonth() + 1)
    return end
  }
  if (durationDays === 180) {
    end.setMonth(end.getMonth() + 6)
    return end
  }
  end.setDate(end.getDate() + durationDays)
  return end
}
