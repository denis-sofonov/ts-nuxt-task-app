import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const TEST_DATABASE_URL =
  process.env.NUXT_TEST_DATABASE_URL ??
  'postgresql://taskflow:taskflow@localhost:5436/taskflow_test'

// Runs the production build (`pnpm build` first) against the test database.
// Using the built server avoids the dev-mode Vite IPC socket entirely.
export default defineConfig({
  testDir: './e2e',
  globalSetup: './test/e2e/global-setup.ts',
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node .output/server/index.mjs',
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: String(PORT),
      NITRO_PORT: String(PORT),
      NUXT_DATABASE_URL: TEST_DATABASE_URL,
      NUXT_SESSION_PASSWORD: 'playwright-test-session-secret-32-chars-min',
      NUXT_PUBLIC_APP_NAME: 'TaskFlow',
    },
  },
})
