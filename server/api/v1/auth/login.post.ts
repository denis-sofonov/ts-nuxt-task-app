import { loginSchema } from '#shared/schemas/auth'

// A valid Argon2id hash of a value no user can have. Verifying against it when
// the email is unknown keeps the response time roughly constant, so attackers
// cannot probe which emails exist by timing the login.
const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$qk+K2ZQG/vwlpr5Y3kMxSw$Z5F11+B/wOTdop/yDgvLt8cYk0DQojQdBHnHyewyW3E'

defineRouteMeta({
  openAPI: { tags: ['Auth'], summary: 'Log in', description: 'Authenticate and start a session.' },
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBodyZod(event, loginSchema)
  const db = useDb()

  const [user] = await db.select().from(tables.users).where(eq(tables.users.email, email)).limit(1)

  const passwordValid = await verifyUserPassword(user?.passwordHash ?? DUMMY_HASH, password)

  // Same error whether the email is unknown or the password is wrong.
  if (!user || !passwordValid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const sessionUser = { id: user.id, email: user.email, name: user.name }
  await setUserSession(event, { user: sessionUser })
  return { user: sessionUser }
})
