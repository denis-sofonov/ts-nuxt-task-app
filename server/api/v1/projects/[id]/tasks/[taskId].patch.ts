import { updateTaskSchema } from '#shared/schemas/task'

export default defineEventHandler(async (event) => {
  const projectId = getUuidParam(event, 'id')
  const taskId = getUuidParam(event, 'taskId')
  await requireOwnedTask(event, projectId, taskId)
  const changes = await readValidatedBodyZod(event, updateTaskSchema)
  const db = useDb()

  const [task] = await db
    .update(tables.tasks)
    .set(changes)
    .where(eq(tables.tasks.id, taskId))
    .returning()

  // requireOwnedTask loaded the row, but a concurrent delete could remove it
  // before this update lands.
  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  return { task: toTaskDto(task) }
})
