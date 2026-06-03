import { verifyEmailSchema } from '#shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const { token } = await readValidatedBodyZod(event, verifyEmailSchema)

  const userId = await consumeAuthToken(token, 'email_verification')
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired token' })
  }

  const db = useDb()
  await db
    .update(tables.users)
    .set({ emailVerifiedAt: new Date() })
    .where(eq(tables.users.id, userId))

  return { success: true }
})
