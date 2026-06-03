import { forgotPasswordSchema } from '#shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBodyZod(event, forgotPasswordSchema)
  const db = useDb()

  const [user] = await db.select().from(tables.users).where(eq(tables.users.email, email)).limit(1)

  // Only send when the account exists, but always answer the same way so the
  // endpoint cannot be used to discover which emails are registered.
  if (user) {
    await sendPasswordResetEmail(user)
  }

  return { success: true }
})
