import type { CreateTaskInput, UpdateTaskInput } from '#shared/schemas/task'

/** Tasks belonging to a project, with create/update/delete actions. */
export function useProjectTasks(projectId: string) {
  const { data, pending, error, refresh } = useFetch(`/api/projects/${projectId}/tasks`, {
    query: { limit: 100 },
  })

  const tasks = computed(() => data.value?.data ?? [])

  async function createTask(input: CreateTaskInput) {
    await $fetch(`/api/projects/${projectId}/tasks`, { method: 'POST', body: input })
    await refresh()
  }

  async function updateTask(taskId: string, input: UpdateTaskInput) {
    await $fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'PATCH', body: input })
    await refresh()
  }

  async function removeTask(taskId: string) {
    await $fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' })
    await refresh()
  }

  return { tasks, pending, error, refresh, createTask, updateTask, removeTask }
}
