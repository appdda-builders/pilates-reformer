export function shouldUseSqlite(): boolean {
  if (process.env.DB_DRIVER === "postgres") return false
  if (process.env.DB_DRIVER === "sqlite") return true
  const dbUrl = process.env.DATABASE_URL ?? ""
  if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) return false
  return false
}

export function getPgDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
}

export function shouldUsePgBuildFallback(): boolean {
  if (shouldUseSqlite()) return false
  if (getPgDatabaseUrl()) return false
  return process.env.NEXT_PHASE === "phase-production-build"
}
