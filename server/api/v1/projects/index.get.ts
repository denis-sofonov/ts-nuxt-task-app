import { paginationSchema } from '#shared/schemas/pagination'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { page, limit } = await getValidatedQueryZod(event, paginationSchema)
  const db = useDb()

  const where = eq(tables.projects.userId, user.id)
  const offset = (page - 1) * limit

  const [data, [totals]] = await Promise.all([
    db
      .select()
      .from(tables.projects)
      .where(where)
      .orderBy(desc(tables.projects.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(tables.projects).where(where),
  ])

  return { data, pagination: buildPageMeta(page, limit, totals?.total ?? 0) }
})
