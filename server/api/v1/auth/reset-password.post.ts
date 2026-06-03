import { resetPasswordSchema } from '#shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const { token, password } = await readValidatedBodyZod(event, resetPasswordSchema)

  const userId = await consumeAuthToken(token, 'password_reset')
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired token' })
  }

  const db = useDb()
  const passwordHash = await hashUserPassword(password)
  await db.update(tables.users).set({ passwordHash }).where(eq(tables.users.id, userId))

  return { success: true }
})
