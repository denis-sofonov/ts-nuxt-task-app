import type { H3Event } from 'h3'
import { z } from 'zod'
import type { Project, Task } from '../database/schema'

/** Validate a route param as a UUID, treating anything else as "not found". */
export function getUuidParam(event: H3Event, name: string): string {
  const result = z.uuid().safeParse(getRouterParam(event, name))
  if (!result.success) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return result.data
}

/**
 * Load a project and assert the session user owns it.
 *
 * Missing -> 404, owned by someone else -> 403. The 403 deliberately confirms
 * existence (per the project's access spec); a stricter design would return 404
 * in both cases to avoid disclosing that the id exists.
 */
export async function requireOwnedProject(
  event: H3Event,
  projectId: string,
): Promise<{ project: Project; userId: string }> {
  const { user } = await requireUserSession(event)
  const db = useDb()

  const [project] = await db
    .select()
    .from(tables.projects)
    .where(eq(tables.projects.id, projectId))
    .limit(1)

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }
  if (project.userId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return { project, userId: user.id }
}

/** Load a task scoped to a project the session user owns. */
export async function requireOwnedTask(
  event: H3Event,
  projectId: string,
  taskId: string,
): Promise<{ task: Task; project: Project; userId: string }> {
  const { project, userId } = await requireOwnedProject(event, projectId)
  const db = useDb()

  const [task] = await db
    .select()
    .from(tables.tasks)
    .where(and(eq(tables.tasks.id, taskId), eq(tables.tasks.projectId, projectId)))
    .limit(1)

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  return { task, project, userId }
}
