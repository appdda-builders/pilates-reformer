function addOrigin(set: Set<string>, value: string | undefined) {
  if (!value) return
  const raw = value.trim()
  if (!raw) return
  try {
    const url = raw.startsWith("http://") || raw.startsWith("https://")
      ? new URL(raw)
      : new URL(`https://${raw}`)
    set.add(url.origin)
  } catch {
    void 0
  }
}

export function getTrustedOrigins(): string[] {
  const origins = new Set<string>([
    "http://localhost:3000",
    "http://localhost:3001",
  ])

  addOrigin(origins, process.env.BETTER_AUTH_URL)
  addOrigin(origins, process.env.NEXT_PUBLIC_APP_URL)

  if (process.env.VERCEL_URL) {
    addOrigin(origins, `https://${process.env.VERCEL_URL}`)
  }
  addOrigin(origins, process.env.VERCEL_BRANCH_URL)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    addOrigin(origins, `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  }

  return [...origins]
}
