import type { TaskStatus } from '#shared/constants/task-status'

export interface UserStats {
  projects: number
  tasks: number
  tasksByStatus: Record<TaskStatus, number>
}

// Aggregating counts on every page load is wasteful, so the result is cached in
// Nitro storage per user for a short window. The trade-off is up to `maxAge`
// seconds of staleness on the counters, which is fine for a summary.
export const getUserStats = defineCachedFunction(
  async (userId: string): Promise<UserStats> => {
    const db = useDb()

    const [projectCount] = await db
      .select({ value: count() })
      .from(tables.projects)
      .where(eq(tables.projects.userId, userId))

    const rows = await db
      .select({ status: tables.tasks.status, value: count() })
      .from(tables.tasks)
      .innerJoin(tables.projects, eq(tables.tasks.projectId, tables.projects.id))
      .where(eq(tables.projects.userId, userId))
      .groupBy(tables.tasks.status)

    const tasksByStatus: Record<TaskStatus, number> = { todo: 0, in_progress: 0, done: 0 }
    let tasks = 0
    for (const row of rows) {
      tasksByStatus[row.status] = row.value
      tasks += row.value
    }

    return { projects: projectCount?.value ?? 0, tasks, tasksByStatus }
  },
  {
    name: 'user-stats',
    maxAge: 15,
    getKey: (userId: string) => userId,
  },
)
