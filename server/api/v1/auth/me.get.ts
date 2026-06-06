defineRouteMeta({
  openAPI: { tags: ['Auth'], summary: 'Current user', description: 'The authenticated account.' },
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const db = useDb()

  // Read fresh from the database so fields that change after login (e.g. email
  // verification) are always current, unlike the values sealed in the cookie.
  const [record] = await db
    .select({
      id: tables.users.id,
      email: tables.users.email,
      name: tables.users.name,
      emailVerifiedAt: tables.users.emailVerifiedAt,
    })
    .from(tables.users)
    .where(eq(tables.users.id, user.id))
    .limit(1)

  if (!record) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return { user: record }
})
