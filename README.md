# ts-nuxt-task-app

[![CI](https://github.com/denis-sofonov/ts-nuxt-task-app/actions/workflows/ci.yml/badge.svg)](https://github.com/denis-sofonov/ts-nuxt-task-app/actions/workflows/ci.yml)

A full-stack task manager built end to end on **Nuxt 4** and **Nitro**
(TypeScript). It implements the same projects-and-tasks domain as its sibling
backends — [`php-laravel-task-api`](https://github.com/denis-sofonov) and
[`python-fastapi-task-api`](https://github.com/denis-sofonov) — so the same
problem can be compared across stacks. This is the full-stack take: the server
API **and** the UI live in one application, with end-to-end type safety from the
database schema through to the Vue components.

## Features

- Email + password auth with server-side sessions (sealed httpOnly cookies)
- Email verification and password reset via single-use, hashed tokens
- Projects and nested tasks with ownership-based authorization
- Pagination, search, status filtering and whitelisted sorting
- Rate limiting, Origin-based CSRF protection and a versioned `/api/v1`
- Health probe, cached per-user stats, structured request logs, a scheduled
  cleanup task and an auto-generated OpenAPI document

## Stack

| Concern        | Choice                                                |
| -------------- | ----------------------------------------------------- |
| Framework      | Nuxt 4 (SSR) + Nitro server engine                    |
| Language       | TypeScript (strict)                                   |
| UI             | Vue 3 (Composition API), Tailwind v4, shadcn-vue      |
| Database       | PostgreSQL 17                                         |
| ORM/migrations | Drizzle ORM + drizzle-kit                             |
| Validation     | Zod (schemas shared by the server and the forms)      |
| Auth           | Server sessions in httpOnly cookies (nuxt-auth-utils) |
| State          | Pinia + composables                                   |
| Tests          | Vitest, @nuxt/test-utils, Playwright                  |
| Tooling        | ESLint (flat) + Prettier, vue-tsc typecheck           |

## Domain

`User` → `Project` → `Task` (one-to-many at each level). Tasks carry a status
enum (`todo` / `in_progress` / `done`). Access is ownership-based: a user only
ever sees and mutates their own data; another user's resource returns `403`, a
missing one `404`.

## Getting started

### Prerequisites

- Node.js 22.12+ (the version in `.nvmrc`)
- pnpm 10+
- Docker

### Run everything in Docker

```bash
docker compose up --build
```

This builds the app image, starts PostgreSQL and Mailhog, runs migrations as a
one-shot job, then serves the app at <http://localhost:3000>. Outgoing email
lands in the Mailhog inbox at <http://localhost:8025>.

### Local development

Run only the infrastructure in Docker and the app on the host:

```bash
pnpm install
cp .env.example .env           # adjust secrets as needed
docker compose up -d db mailhog
pnpm db:migrate                # apply schema migrations
pnpm db:seed                   # optional: demo user + sample data
pnpm dev                       # http://localhost:3000
```

Demo login after seeding: `demo@taskflow.dev` / `password123`.

> **macOS note:** the `dev` script sets `TMPDIR=/tmp` so the Vite dev-server IPC
> socket path stays under the 104-byte `sun_path` limit. The default
> `/var/folders/…` temp path overflows it and breaks dev SSR with `EINVAL`.

## API documentation

With the app running, the auto-generated OpenAPI document is at
`/_openapi.json` and a Scalar UI at [`/_scalar`](http://localhost:3000/_scalar).
Routes are grouped by tag (Auth, Projects, Tasks, System).

## Quality gate

```bash
pnpm qa            # lint + format check + typecheck + tests with coverage
pnpm lint          # ESLint (warnings fail the build)
pnpm typecheck     # vue-tsc via nuxt typecheck
```

## Testing

```bash
pnpm test          # Vitest unit + component tests
pnpm test:coverage # the above with a 70% coverage gate
pnpm test:e2e      # Playwright flow (run `pnpm build` first)
```

The strategy is layered: Vitest unit tests cover the schemas and server
utilities, a `@nuxt/test-utils` component test renders a representative
component, and a Playwright run drives the full browser journey (register →
project → task → status → sign out/in) against the production build and a
dedicated test database. Coverage is measured on the project's own logic;
generated UI primitives and integration-tested routes are excluded.

## Conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org),
enforced on commit by a Husky `commit-msg` hook running commitlint. A
`pre-commit` hook runs lint-staged (ESLint + Prettier on staged files). Use
`pnpm commit` for a guided commitizen prompt. Dependencies and the base image
are kept current by Dependabot.

## Project structure

```
app/            Vue app — pages, layouts, components, stores, composables
  components/ui   shadcn-vue primitives (owned in-repo)
server/         Nitro — API routes (api/v1), middleware, plugins, tasks
  database/       Drizzle schema, migrations, seed
  utils/          auto-imported server helpers (db, auth, mailer, …)
shared/         code used by both sides — Zod schemas, types, constants
test/ · e2e/    Vitest suites and the Playwright flow
```

## Design decisions & trade-offs

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
- **Hashed, single-use recovery tokens.** Only the SHA-256 hash of a token is
  stored, so a database leak cannot reveal a usable verification or reset link.
- **shadcn-vue with a custom theme.** Components are generated into the repo and
  owned here (built on Reka UI primitives for accessibility), then re-themed
  with a restrained custom palette instead of the default look.
- **Versioned API under `/api/v1`.** A namespace from the start means a future
  breaking change can ship as `/api/v2` without disturbing existing clients.
- **Layered CSRF defence.** `SameSite=Lax` on the sealed session cookie plus an
  Origin check on every mutating request. No token plumbing is needed because
  the app is same-origin and the API is JSON-only.
- **In-memory rate limiting.** A fixed-window limiter (stricter on auth routes)
  on Nitro storage. Correct for a single instance; a multi-instance deployment
  would point the same storage API at Redis. Kept simple on purpose.
- **Known auth trade-offs (deliberate).** Sealed stateless session cookies can't
  be revoked server-side, so logout and password reset don't invalidate other
  live sessions until they expire — instant revocation would need a session
  store or per-user token version. And registration returns `409` for a taken
  email (clear UX) rather than hiding it; login and password reset are written
  to avoid account enumeration, but registration intentionally is not.
- **Migrations as a job, not at boot.** Compose runs migrations in a dedicated
  one-shot service the app waits on, so multiple app instances never race to
  migrate the same database.

## License

[MIT](./LICENSE) © 2026 Denis Sofonov
