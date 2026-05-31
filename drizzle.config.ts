import { defineConfig } from 'drizzle-kit'

// drizzle-kit runs outside Nitro, so it reads the connection string straight
// from .env. Node 22 can load it natively — no dotenv dependency required.
// In CI the variables come from the environment, so a missing file is fine.
try {
  process.loadEnvFile?.()
} catch {
  // no .env file; rely on the ambient environment
}

export default defineConfig({
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
})
