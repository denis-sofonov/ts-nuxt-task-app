import { registerSchema } from '#shared/schemas/auth'

defineRouteMeta({
  openAPI: { tags: ['Auth'], summary: 'Register', description: 'Create an account and session.' },
})

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readValidatedBodyZod(event, registerSchema)
  const db = useDb()

  const [existing] = await db
    .select({ id: tables.users.id })
    .from(tables.users)
    .where(eq(tables.users.email, email))
    .limit(1)

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }

  const passwordHash = await hashUserPassword(password)

  const inserted = await db
    .insert(tables.users)
    .values({ name, email, passwordHash })
    .returning({ id: tables.users.id, email: tables.users.email, name: tables.users.name })
    .catch((error: unknown) => {
      // Backstop for the check-then-insert race: the lower(email) unique index
      // still guarantees correctness under concurrent registrations.
      if (isUniqueViolation(error)) {
        throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
      }
      throw error
    })

  const user = inserted[0]!

  // Fire-and-forget: a mail outage must not fail registration.
  await sendVerificationEmail(user).catch((error: unknown) => {
    console.error('Failed to send verification email', error)
  })

  await setUserSession(event, { user })
  setResponseStatus(event, 201)
  return { user }
})
