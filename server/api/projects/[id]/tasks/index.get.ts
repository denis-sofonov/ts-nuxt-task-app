import { paginationSchema } from '#shared/schemas/pagination'

export default defineEventHandler(async (event) => {
  const projectId = getUuidParam(event, 'id')
  await requireOwnedProject(event, projectId)
  const { page, limit } = await getValidatedQueryZod(event, paginationSchema)
  const db = useDb()

  const where = eq(tables.tasks.projectId, projectId)
  const offset = (page - 1) * limit

  const [data, [totals]] = await Promise.all([
    db
      .select()
      .from(tables.tasks)
      .where(where)
      .orderBy(desc(tables.tasks.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(tables.tasks).where(where),
  ])

  return { data, pagination: buildPageMeta(page, limit, totals?.total ?? 0) }
})
