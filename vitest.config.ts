import { defineVitestConfig } from '@nuxt/test-utils/config'

// Coverage is measured on the project's own logic (schemas, utils, composables,
// a representative component). Generated shadcn primitives, pages and the
// integration-tested server routes are excluded; pages and routes are covered by
// the Playwright end-to-end flow instead.
export default defineVitestConfig({
  test: {
    environment: 'node',
    include: ['test/unit/**/*.spec.ts', 'test/component/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      include: [
        'shared/schemas/**/*.ts',
        'shared/constants/**/*.ts',
        'app/composables/useApiError.ts',
        'app/components/StatusBadge.vue',
        'server/utils/dto.ts',
        'server/utils/pagination.ts',
        'server/utils/password.ts',
        'server/utils/postgres.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
})
