# ts-nuxt-task-app

A full-stack task manager built end to end on **Nuxt 4** and **Nitro**
(TypeScript). It implements the same projects-and-tasks domain as its sibling
backends — [`php-laravel-task-api`](https://github.com/denis-sofonov) and
[`python-fastapi-task-api`](https://github.com/denis-sofonov) — so the same
problem can be compared across stacks. This is the full-stack take: server API
**and** the UI live in one application.

## Stack

| Concern        | Choice                                                |
| -------------- | ----------------------------------------------------- |
| Framework      | Nuxt 4 (SSR) + Nitro server engine                    |
| Language       | TypeScript (strict)                                   |
| UI             | Vue 3 (Composition API), Tailwind v4, shadcn-vue      |
| Database       | PostgreSQL 17                                         |
| ORM/migrations | Drizzle ORM + drizzle-kit                             |
| Validation     | Zod (shared server + form schemas)                    |
| Auth           | Server sessions in httpOnly cookies (nuxt-auth-utils) |
| State          | Pinia + composables                                   |
| Tests          | Vitest, @nuxt/test-utils, Playwright                  |
| Tooling        | ESLint (flat) + Prettier, vue-tsc typecheck           |

## Domain

`User` → `Project` → `Task` (one-to-many at each level). Tasks carry a status
enum (`todo` / `in_progress` / `done`). Access is ownership-based: a user only
ever sees and mutates their own data (others get `403`).

## Getting started

### Prerequisites

- Node.js 22.12+ (the version in `.nvmrc`)
- pnpm 10+
- Docker (for PostgreSQL)

### Local development

```bash
pnpm install
cp .env.example .env          # adjust secrets as needed
docker compose up -d db       # PostgreSQL on host port 5436
pnpm dev                      # http://localhost:3000
```

> Database schema, migrations and seeds are introduced in the next stage.

## Quality gate

```bash
pnpm qa            # lint + format check + typecheck
pnpm lint          # ESLint
pnpm format        # Prettier (write)
pnpm typecheck     # vue-tsc via nuxt typecheck
```

## Design decisions & trade-offs

This section grows as the project does. Decisions made so far:

- **Drizzle over Prisma.** Drizzle is SQL-first with no separate generated
  client or query engine binary, which keeps types close to the schema and the
  Docker image small. Migrations are plain SQL a reviewer can read.
- **Server sessions over JWT.** For an SSR app backed by one database, sealed
  httpOnly session cookies are simpler and safer than JWTs: instant
  revocation/logout, no token to leak via XSS, no client-side storage problem.
  JWTs earn their keep in stateless multi-service setups — not this one.
- **Argon2id for password hashing** (via `@node-rs/argon2`). It is the current
  OWASP first choice, and the Rust napi bindings ship prebuilt binaries, so the
  Alpine multi-stage build stays free of `node-gyp`.
- **shadcn-vue with a custom theme.** Components are generated into the repo and
  owned here (built on Reka UI primitives for accessibility), then re-themed
  with a restrained custom palette instead of the default look.

## License

[MIT](./LICENSE) © 2026 Denis Sofonov
