// Central place to observe unhandled server faults. Client errors (4xx) are
// expected control flow and stay quiet; 5xx are logged as structured JSON so
// they are greppable in aggregators. The response body itself is the consistent
// h3 `createError` envelope ({ statusCode, statusMessage, message, data? }).
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500
    if (statusCode < 500) return

    console.error(
      JSON.stringify({
        level: 'error',
        time: new Date().toISOString(),
        method: event?.method,
        path: event?.path,
        statusCode,
        message: error instanceof Error ? error.message : String(error),
      }),
    )
  })
})
