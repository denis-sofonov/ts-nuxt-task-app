import { z } from 'zod'
import { paginationSchema } from './pagination'
import { taskStatusSchema } from './task'

const order = z.enum(['asc', 'desc']).default('desc')

// Sort fields are constrained to an allow-list (not free-form column names), so
// the value can be mapped to a known column server-side without any injection risk.
export const projectListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
  order,
})

export const taskListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(200).optional(),
  status: taskStatusSchema.optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'title', 'status']).default('createdAt'),
  order,
})

export type ProjectListQuery = z.infer<typeof projectListQuerySchema>
export type TaskListQuery = z.infer<typeof taskListQuerySchema>
