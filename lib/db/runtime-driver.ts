export function shouldUseSqlite(): boolean {
  if (process.env.VERCEL === "1") return false
  return process.env.DB_DRIVER === "sqlite"
}

export function getPgDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
}

export function shouldUsePgBuildFallback(): boolean {
  if (shouldUseSqlite()) return false
  if (getPgDatabaseUrl()) return false
  return process.env.NEXT_PHASE === "phase-production-build"
}
