import { createProjectSchema } from '#shared/schemas/project'

defineRouteMeta({
  openAPI: { tags: ['Projects'], summary: 'Create a project' },
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { name, description } = await readValidatedBodyZod(event, createProjectSchema)
  const db = useDb()

  const [project] = await db
    .insert(tables.projects)
    .values({ userId: user.id, name, description })
    .returning()

  setResponseStatus(event, 201)
  return { project }
})
