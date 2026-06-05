// Liveness + DB readiness probe for orchestrators and uptime checks.
// Returns 503 when the database is unreachable so a load balancer can react.
export default defineEventHandler(async (event) => {
  let database: 'up' | 'down' = 'up'

  try {
    await useDb().execute(sql`select 1`)
  } catch {
    database = 'down'
  }

  const healthy = database === 'up'
  setResponseStatus(event, healthy ? 200 : 503)

  return {
    status: healthy ? 'ok' : 'degraded',
    database,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  }
})
