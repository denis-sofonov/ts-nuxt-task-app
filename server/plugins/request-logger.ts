// Structured access logs for API requests. Pairs with the error plugin: this
// records one JSON line per API call (method, path, status, latency); assets and
// HMR traffic are skipped to keep the output signal-dense.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    ;(event.context as { startTime?: number }).startTime = performance.now()
  })

  nitroApp.hooks.hook('afterResponse', (event) => {
    if (!event.path.startsWith('/api/')) return

    const startTime = (event.context as { startTime?: number }).startTime
    console.info(
      JSON.stringify({
        level: 'info',
        time: new Date().toISOString(),
        method: event.method,
        path: event.path,
        status: getResponseStatus(event),
        durationMs: startTime ? Math.round(performance.now() - startTime) : undefined,
      }),
    )
  })
})
