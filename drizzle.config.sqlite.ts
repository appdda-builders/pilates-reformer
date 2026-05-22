import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./lib/db/schema.sqlite.ts",
  out: "./drizzle-sqlite",
  dialect: "sqlite",
  dbCredentials: {
    url: "local.db",
  },
})
