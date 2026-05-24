import { hash } from '@node-rs/argon2'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Standalone script (run via tsx), so it loads its own env and opens a
// short-lived connection instead of reusing the Nitro runtime client.
process.loadEnvFile?.()

const DEMO_PASSWORD = 'password123'

async function main() {
  const url = process.env.NUXT_DATABASE_URL
  if (!url) {
    throw new Error('NUXT_DATABASE_URL is required to seed the database')
  }

  const client = postgres(url, { max: 1 })
  const db = drizzle(client, { schema, casing: 'snake_case' })

  try {
    // Make the seed re-runnable.
    await db.delete(schema.tasks)
    await db.delete(schema.projects)
    await db.delete(schema.users)

    const passwordHash = await hash(DEMO_PASSWORD)

    // Two users so ownership rules (and 403s) are demonstrable from seed data.
    const [demo, alice] = await db
      .insert(schema.users)
      .values([
        { email: 'demo@taskflow.dev', name: 'Demo User', passwordHash },
        { email: 'alice@taskflow.dev', name: 'Alice Martin', passwordHash },
      ])
      .returning()

    const [website, mobile] = await db
      .insert(schema.projects)
      .values([
        { userId: demo!.id, name: 'Website redesign', description: 'Marketing site refresh.' },
        { userId: demo!.id, name: 'API platform', description: 'Internal services.' },
        { userId: alice!.id, name: "Alice's notebook", description: 'Personal backlog.' },
      ])
      .returning()

    await db.insert(schema.tasks).values([
      { projectId: website!.id, title: 'Audit current pages', status: 'done' },
      { projectId: website!.id, title: 'Design new hero', status: 'in_progress' },
      { projectId: website!.id, title: 'Implement dark mode', status: 'todo' },
      { projectId: mobile!.id, title: 'Define OpenAPI contract', status: 'in_progress' },
      { projectId: mobile!.id, title: 'Set up rate limiting', status: 'todo' },
    ])

    console.info('Seed complete: 2 users, 3 projects, 5 tasks.')
    console.info(`Demo login: demo@taskflow.dev / ${DEMO_PASSWORD}`)
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exitCode = 1
})
