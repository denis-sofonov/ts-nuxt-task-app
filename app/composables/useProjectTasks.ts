import type { TaskStatus } from '#shared/constants/task-status'
import type { CreateTaskInput, UpdateTaskInput } from '#shared/schemas/task'

/** Tasks belonging to a project, with status filtering and CRUD actions. */
export function useProjectTasks(projectId: string) {
  // Empty string = no filter; mapped to undefined so ofetch drops the param
  // (an empty `status=` would fail the enum validation server-side).
  const status = ref<TaskStatus | ''>('')

  const { data, pending, error, refresh } = useFetch(`/api/v1/projects/${projectId}/tasks`, {
    query: { limit: 100, status: computed(() => status.value || undefined) },
  })

  const tasks = computed(() => data.value?.data ?? [])

  async function createTask(input: CreateTaskInput) {
    await $fetch(`/api/v1/projects/${projectId}/tasks`, { method: 'POST', body: input })
    await refresh()
  }

  async function updateTask(taskId: string, input: UpdateTaskInput) {
    await $fetch(`/api/v1/projects/${projectId}/tasks/${taskId}`, { method: 'PATCH', body: input })
    await refresh()
  }

  async function removeTask(taskId: string) {
    await $fetch(`/api/v1/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' })
    await refresh()
  }

  return { tasks, status, pending, error, refresh, createTask, updateTask, removeTask }
}
