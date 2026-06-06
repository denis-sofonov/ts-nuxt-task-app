import { projectListQuerySchema } from '#shared/schemas/list-query'

const SORT_COLUMNS = {
  createdAt: tables.projects.createdAt,
  updatedAt: tables.projects.updatedAt,
  name: tables.projects.name,
}

defineRouteMeta({
  openAPI: {
    tags: ['Projects'],
    summary: 'List projects',
    description: 'Paginated, searchable, sortable.',
  },
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { page, limit, search, sort, order } = await getValidatedQueryZod(
    event,
    projectListQuerySchema,
  )
  const db = useDb()

  const conditions = [eq(tables.projects.userId, user.id)]
  if (search) {
    conditions.push(ilike(tables.projects.name, `%${search}%`))
  }
  const where = and(...conditions)

  const direction = order === 'asc' ? asc(SORT_COLUMNS[sort]) : desc(SORT_COLUMNS[sort])
  const offset = (page - 1) * limit

  const [data, [totals]] = await Promise.all([
    db.select().from(tables.projects).where(where).orderBy(direction).limit(limit).offset(offset),
    db.select({ total: count() }).from(tables.projects).where(where),
  ])

  return { data, pagination: buildPageMeta(page, limit, totals?.total ?? 0) }
})
