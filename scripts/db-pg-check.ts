import postgres from "postgres"

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

  if (!url) {
    console.error("Falta DATABASE_URL en .env.local")
    process.exit(1)
  }

  const sql = postgres(url, { max: 1 })

  try {
    const version = await sql`SELECT version() AS v`
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log("Conexión OK")
    console.log(version[0]?.v)
    console.log("Tablas:", tables.map((r) => r.table_name).join(", ") || "(ninguna)")
  } catch (err) {
    console.error("Error de conexión:", err)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

main()
