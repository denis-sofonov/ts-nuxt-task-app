import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

// Prepare the dedicated test database before the Playwright run: apply
// migrations and start from a clean slate so the flow is deterministic.
export default async function globalSetup() {
  const url =
    process.env.NUXT_TEST_DATABASE_URL ??
    'postgresql://taskflow:taskflow@localhost:5436/taskflow_test'

  const sql = postgres(url, { max: 1 })
  try {
    await migrate(drizzle(sql), { migrationsFolder: './server/database/migrations' })
    await sql`TRUNCATE TABLE tasks, projects, users RESTART IDENTITY CASCADE`
  } finally {
    await sql.end()
  }
}
