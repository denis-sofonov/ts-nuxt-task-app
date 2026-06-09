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

  // Note: sessions are sealed stateless cookies, so any already-issued session
  // stays valid until it expires. Invalidating them on reset would require a
  // server-side session store or a per-user token version checked per request.
  return { success: true }
})
