import { updateProjectSchema } from '#shared/schemas/project'

export default defineEventHandler(async (event) => {
  const projectId = getUuidParam(event, 'id')
  await requireOwnedProject(event, projectId)
  const changes = await readValidatedBodyZod(event, updateProjectSchema)
  const db = useDb()

  const [project] = await db
    .update(tables.projects)
    .set(changes)
    .where(eq(tables.projects.id, projectId))
    .returning()

  // requireOwnedProject loaded the row, but a concurrent delete could remove it
  // before this update lands.
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  return { project: toProjectDto(project) }
})
