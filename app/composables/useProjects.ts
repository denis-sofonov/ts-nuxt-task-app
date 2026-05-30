import type { CreateProjectInput, UpdateProjectInput } from '#shared/schemas/project'

/** List + mutate the current user's projects. SSR-fetched, refetched on page change. */
export function useProjects() {
  const page = ref(1)
  const limit = ref(12)

  const { data, pending, error, refresh } = useFetch('/api/projects', {
    query: { page, limit },
  })

  const projects = computed(() => data.value?.data ?? [])
  const pagination = computed(() => data.value?.pagination ?? null)

  async function createProject(input: CreateProjectInput) {
    await $fetch('/api/projects', { method: 'POST', body: input })
    await refresh()
  }

  async function updateProject(id: string, input: UpdateProjectInput) {
    await $fetch(`/api/projects/${id}`, { method: 'PATCH', body: input })
    await refresh()
  }

  async function removeProject(id: string) {
    await $fetch(`/api/projects/${id}`, { method: 'DELETE' })
    await refresh()
  }

  return {
    projects,
    pagination,
    page,
    limit,
    pending,
    error,
    refresh,
    createProject,
    updateProject,
    removeProject,
  }
}
