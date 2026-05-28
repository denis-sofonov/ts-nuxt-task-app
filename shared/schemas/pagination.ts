import { z } from 'zod'

// Query strings are always strings, so coerce before validating the bounds.
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationQuery = z.infer<typeof paginationSchema>
