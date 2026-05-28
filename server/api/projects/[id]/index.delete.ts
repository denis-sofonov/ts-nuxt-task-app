export default defineEventHandler(async (event) => {
  const projectId = getUuidParam(event, 'id')
  await requireOwnedProject(event, projectId)
  const db = useDb()

  // Tasks are removed by the ON DELETE CASCADE foreign key.
  await db.delete(tables.projects).where(eq(tables.projects.id, projectId))

  setResponseStatus(event, 204)
  return null
})
