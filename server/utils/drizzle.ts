import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../database/schema'

// Single namespace so routes read `tables.projects` rather than importing each.
export const tables = schema

export { and, asc, count, desc, eq, ilike, inArray, lt, or, sql } from 'drizzle-orm'

export type Database = PostgresJsDatabase<typeof schema>

let _db: Database | undefined
let _client: ReturnType<typeof postgres> | undefined

/**
 * Lazily-created singleton Drizzle client. Nitro auto-imports this from
 * server/utils, so every route/event handler can call `useDb()` directly.
 *
 * A single pooled connection is shared across the server process; opening a new
 * pool per request would exhaust Postgres connections under load.
 */
export function useDb(): Database {
  if (!_db) {
    const { databaseUrl } = useRuntimeConfig()
    if (!databaseUrl) {
      throw new Error('NUXT_DATABASE_URL is not set')
    }
    _client = postgres(databaseUrl, { max: 10 })
    _db = drizzle(_client, { schema, casing: 'snake_case' })
  }
  return _db
}
