export default defineEventHandler(async (event) => {
  const projectId = getUuidParam(event, 'id')
  const taskId = getUuidParam(event, 'taskId')
  await requireOwnedTask(event, projectId, taskId)
  const db = useDb()

  await db.delete(tables.tasks).where(eq(tables.tasks.id, taskId))

  setResponseStatus(event, 204)
  return null
})
