// Single source of truth for the task status values: the Drizzle pgEnum, the
// Zod validators and the client types all derive from this tuple.
export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]
