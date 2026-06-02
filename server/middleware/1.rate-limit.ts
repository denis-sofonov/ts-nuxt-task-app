interface Bucket {
  count: number
  resetAt: number
}

const WINDOW_MS = 60_000
const AUTH_LIMIT = 10 // login/register: tighter, to blunt credential stuffing
const API_LIMIT = 100

// Fixed-window limiter keyed by client IP. Backed by Nitro's default storage,
// which is in-memory: correct for a single instance. A multi-instance
// deployment would mount a shared driver (e.g. Redis) under this same API.
export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/')) return

  const isAuth = event.path.startsWith('/api/v1/auth/')
  const limit = isAuth ? AUTH_LIMIT : API_LIMIT
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const key = `ratelimit:${isAuth ? 'auth' : 'api'}:${ip}`

  const storage = useStorage()
  const now = Date.now()
  const bucket = await storage.getItem<Bucket>(key)

  if (!bucket || bucket.resetAt <= now) {
    await storage.setItem(key, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  if (bucket.count >= limit) {
    setResponseHeader(event, 'Retry-After', Math.ceil((bucket.resetAt - now) / 1000))
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  bucket.count += 1
  await storage.setItem(key, bucket)
})
