type ApiErrorBody = {
  statusMessage?: string
  message?: string
  data?: { errors?: Record<string, string[]> }
}

// The double `.data` is intentional: ofetch puts the parsed response body on
// `error.data`, and h3's `createError({ data })` nests our own payload under a
// further `data` key. So a 422's field errors live at `error.data.data.errors`.

/** Field-level validation errors returned by the 422 responses, keyed by field. */
export function getFieldErrors(error: unknown): Record<string, string[]> {
  return (error as { data?: ApiErrorBody })?.data?.data?.errors ?? {}
}

/** Human-readable message for a failed request, with a sensible fallback. */
export function getApiMessage(error: unknown, fallback = 'Something went wrong'): string {
  const body = (error as { data?: ApiErrorBody })?.data
  return body?.statusMessage || body?.message || fallback
}
