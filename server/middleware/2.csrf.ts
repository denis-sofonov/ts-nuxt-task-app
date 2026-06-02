const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// Origin-based CSRF defence for state-changing API calls. Browsers always send
// an Origin header on these requests, so a cross-site forgery is rejected here;
// the session cookie's SameSite=Lax is the second layer. A missing Origin (a
// non-browser client like curl) is allowed through — it cannot be a CSRF.
export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) return
  if (!MUTATING_METHODS.has(event.method)) return

  const origin = getHeader(event, 'origin')
  if (!origin) return

  const host = getHeader(event, 'host')
  if (new URL(origin).host !== host) {
    throw createError({ statusCode: 403, statusMessage: 'Cross-origin request blocked' })
  }
})
