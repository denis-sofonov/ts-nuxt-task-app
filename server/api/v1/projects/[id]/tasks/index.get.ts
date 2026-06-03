import { taskListQuerySchema } from '#shared/schemas/list-query'

const SORT_COLUMNS = {
  createdAt: tables.tasks.createdAt,
  updatedAt: tables.tasks.updatedAt,
  title: tables.tasks.title,
  status: tables.tasks.status,
}

export default defineEventHandler(async (event) => {
  const projectId = getUuidParam(event, 'id')
  await requireOwnedProject(event, projectId)
  const { page, limit, search, status, sort, order } = await getValidatedQueryZod(
    event,
    taskListQuerySchema,
  )
  const db = useDb()

  const conditions = [eq(tables.tasks.projectId, projectId)]
  if (status) {
    conditions.push(eq(tables.tasks.status, status))
  }
  if (search) {
    conditions.push(ilike(tables.tasks.title, `%${search}%`))
  }
  const where = and(...conditions)

  const direction = order === 'asc' ? asc(SORT_COLUMNS[sort]) : desc(SORT_COLUMNS[sort])
  const offset = (page - 1) * limit

  const [data, [totals]] = await Promise.all([
    db.select().from(tables.tasks).where(where).orderBy(direction).limit(limit).offset(offset),
    db.select({ total: count() }).from(tables.tasks).where(where),
  ])

  return { data, pagination: buildPageMeta(page, limit, totals?.total ?? 0) }
})
