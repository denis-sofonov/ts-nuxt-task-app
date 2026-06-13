import type { Project, Task } from '../database/schema'
import type { ProjectDto, TaskDto } from '#shared/types/domain'

// The single translation point between the persistence model (Drizzle rows,
// `Date` timestamps, every column) and the transport contract the client sees
// (`*Dto`, ISO-string timestamps, an explicit field whitelist). Mapping here —
// rather than returning rows and leaning on JSON serialisation — means a schema
// change that drops or renames a field fails to compile, and a new internal
// column never leaks into a response by accident.

export function toProjectDto(project: Project): ProjectDto {
  return {
    id: project.id,
    userId: project.userId,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }
}

export function toTaskDto(task: Task): TaskDto {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}
