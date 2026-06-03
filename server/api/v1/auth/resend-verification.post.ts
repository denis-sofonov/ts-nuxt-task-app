export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const db = useDb()

  const [record] = await db.select().from(tables.users).where(eq(tables.users.id, user.id)).limit(1)

  if (record && !record.emailVerifiedAt) {
    await sendVerificationEmail(record)
  }

  return { success: true }
})
