import * as schemaPg from "./schema.pg"
import * as schemaSqlite from "./schema.sqlite"
import {
  getPgDatabaseUrl,
  shouldUsePgBuildFallback,
  shouldUseSqlite,
} from "./runtime-driver"

import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"

export type SqliteDb = BetterSQLite3Database<typeof schemaSqlite>
export type PgDb = PostgresJsDatabase<typeof schemaPg>
export type AppDb = SqliteDb

let cachedSqlite: SqliteDb | null = null
let cachedPg: PgDb | null = null

export function getSqliteDb(): SqliteDb {
  if (cachedSqlite) return cachedSqlite
  const { drizzle } = require("drizzle-orm/better-sqlite3")
  const Database = require("better-sqlite3")
  const sqlitePath = shouldUseSqlite() ? "local.db" : ":memory:"
  const raw = new Database(sqlitePath)
  raw.pragma("foreign_keys = ON")
  cachedSqlite = drizzle(raw, { schema: schemaSqlite })
  return cachedSqlite!
}

export function getPgDb(): PgDb {
  if (cachedPg) return cachedPg
  const url = getPgDatabaseUrl()
  if (!url) {
    throw new Error("DATABASE_URL o DATABASE_URL_UNPOOLED es obligatorio para PostgreSQL")
  }
  const { drizzle } = require("drizzle-orm/postgres-js")
  const postgres = require("postgres")
  const client = postgres(url, { max: 10 })
  cachedPg = drizzle(client, { schema: schemaPg })
  return cachedPg!
}

export function getDb(): AppDb {
  if (shouldUseSqlite() || shouldUsePgBuildFallback()) {
    return getSqliteDb()
  }
  if (!getPgDatabaseUrl()) {
    return getSqliteDb()
  }
  return getPgDb() as unknown as AppDb
}

export function getAuthDb(): SqliteDb | PgDb {
  if (shouldUseSqlite() || shouldUsePgBuildFallback() || !getPgDatabaseUrl()) {
    return getSqliteDb()
  }
  return getPgDb()
}

export function getAuthSchema() {
  if (shouldUseSqlite() || shouldUsePgBuildFallback() || !getPgDatabaseUrl()) {
    return schemaSqlite
  }
  return schemaPg
}

export function getAuthProvider(): "sqlite" | "pg" {
  if (shouldUseSqlite() || shouldUsePgBuildFallback() || !getPgDatabaseUrl()) {
    return "sqlite"
  }
  return "pg"
}
