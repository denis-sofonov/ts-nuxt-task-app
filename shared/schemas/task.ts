import { z } from 'zod'
import { TASK_STATUSES } from '../constants/task-status'

export const taskStatusSchema = z.enum(TASK_STATUSES)

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).nullish(),
  status: taskStatusSchema.default('todo'),
})

// Defined without `.default()` so a partial update never silently resets the
// status to "todo" when the field is omitted.
export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().max(2000).nullish(),
    status: taskStatusSchema,
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  })

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
