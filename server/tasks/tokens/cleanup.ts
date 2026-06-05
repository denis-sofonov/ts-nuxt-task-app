// Nitro background task: prune expired verification/reset tokens. Scheduled
// hourly in nuxt.config; also runnable on demand via `nuxi task run tokens:cleanup`.
export default defineTask({
  meta: {
    name: 'tokens:cleanup',
    description: 'Delete expired auth tokens',
  },
  async run() {
    const db = useDb()
    const deleted = await db
      .delete(tables.authTokens)
      .where(lt(tables.authTokens.expiresAt, new Date()))
      .returning({ id: tables.authTokens.id })

    return { result: { deleted: deleted.length } }
  },
})
