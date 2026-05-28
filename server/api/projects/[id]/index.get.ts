export default defineEventHandler(async (event) => {
  const projectId = getUuidParam(event, 'id')
  const { project } = await requireOwnedProject(event, projectId)
  return { project }
})
