import { createTaskSchema } from '#shared/schemas/task'

defineRouteMeta({
  openAPI: { tags: ['Tasks'], summary: 'Create a task in a project' },
})

export default defineEventHandler(async (event) => {
  const projectId = getUuidParam(event, 'id')
  await requireOwnedProject(event, projectId)
  const { title, description, status } = await readValidatedBodyZod(event, createTaskSchema)
  const db = useDb()

  const [task] = await db
    .insert(tables.tasks)
    .values({ projectId, title, description, status })
    .returning()

  if (!task) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create task' })
  }

  setResponseStatus(event, 201)
  return { task: toTaskDto(task) }
})
