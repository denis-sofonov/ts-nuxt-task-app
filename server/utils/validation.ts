import type { H3Event } from 'h3'
import { z } from 'zod'

/**
 * Parse the request body against a Zod schema, throwing a 422 with field-level
 * errors on failure. Keeps every route's validation shape and status identical.
 */
export async function readValidatedBodyZod<T extends z.ZodType>(
  event: H3Event,
  schema: T,
): Promise<z.infer<T>> {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: { errors: z.flattenError(result.error).fieldErrors },
    })
  }
  return result.data
}

/** Same contract as the body validator, for query strings. */
export async function getValidatedQueryZod<T extends z.ZodType>(
  event: H3Event,
  schema: T,
): Promise<z.infer<T>> {
  const query = getQuery(event)
  const result = schema.safeParse(query)
  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: { errors: z.flattenError(result.error).fieldErrors },
    })
  }
  return result.data
}
