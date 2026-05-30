import type { UpdateProjectInput } from '#shared/schemas/project'

/** A single project by id, with update/delete actions. */
export function useProject(id: string) {
  const { data, pending, error, refresh } = useFetch(`/api/projects/${id}`)

  const project = computed(() => data.value?.project ?? null)

  async function updateProject(input: UpdateProjectInput) {
    await $fetch(`/api/projects/${id}`, { method: 'PATCH', body: input })
    await refresh()
  }

  async function removeProject() {
    await $fetch(`/api/projects/${id}`, { method: 'DELETE' })
  }

  return { project, pending, error, refresh, updateProject, removeProject }
}
