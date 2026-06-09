import { relations, sql } from 'drizzle-orm'
import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { TASK_STATUSES } from '../../shared/constants/task-status'

export const taskStatus = pgEnum('task_status', TASK_STATUSES)
export const authTokenType = pgEnum('auth_token_type', ['email_verification', 'password_reset'])

// Column names come from the camelCase keys via `casing: 'snake_case'`, so there
// are no hand-written snake_case names to keep in sync.
export const users = pgTable(
  'users',
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull(),
    // Argon2id hash. Never selected into API responses (see the user serializer).
    passwordHash: text().notNull(),
    name: text().notNull(),
    // Null until the user confirms ownership of the address.
    emailVerifiedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Case-insensitive uniqueness enforced in the database itself, so a race
    // between two requests cannot create "a@x.com" and "A@x.com".
    uniqueIndex('users_email_unique').on(sql`lower(${table.email})`),
  ],
)

export const projects = pgTable(
  'projects',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    description: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('projects_user_id_idx').on(table.userId)],
)

export const tasks = pgTable(
  'tasks',
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text().notNull(),
    description: text(),
    status: taskStatus().notNull().default('todo'),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('tasks_project_id_idx').on(table.projectId),
    index('tasks_status_idx').on(table.status),
  ],
)

// Single-use tokens for email verification and password reset. Only the SHA-256
// hash of the token is stored, so a database leak cannot reveal a usable link.
export const authTokens = pgTable(
  'auth_tokens',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: authTokenType().notNull(),
    tokenHash: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('auth_tokens_token_hash_unique').on(table.tokenHash),
    index('auth_tokens_user_id_idx').on(table.userId),
  ],
)

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  authTokens: many(authTokens),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, { fields: [projects.userId], references: [users.id] }),
  tasks: many(tasks),
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
}))

export const authTokensRelations = relations(authTokens, ({ one }) => ({
  user: one(users, { fields: [authTokens.userId], references: [users.id] }),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
