import { createTaskSchema } from '#shared/schemas/task'

export default defineEventHandler(async (event) => {
  const projectId = getUuidParam(event, 'id')
  await requireOwnedProject(event, projectId)
  const { title, description, status } = await readValidatedBodyZod(event, createTaskSchema)
  const db = useDb()

  const [task] = await db
    .insert(tables.tasks)
    .values({ projectId, title, description, status })
    .returning()

  setResponseStatus(event, 201)
  return { task }
})
