import { defineConfig } from "drizzle-kit"

const url =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL ??
  "postgresql://postgres@159.203.90.92:5432/pilates"

export default defineConfig({
  schema: "./lib/db/schema.pg.ts",
  out: "./drizzle-pg",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
})
