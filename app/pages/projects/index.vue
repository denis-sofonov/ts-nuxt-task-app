<script setup lang="ts">
import { FolderPlus, Plus } from '@lucide/vue'
import { toast } from 'vue-sonner'
import type { CreateProjectInput } from '#shared/schemas/project'
import type { ProjectDto } from '#shared/types/domain'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Projects' })

const {
  projects,
  pagination,
  page,
  pending,
  error,
  refresh,
  createProject,
  updateProject,
  removeProject,
} = useProjects()

const formOpen = ref(false)
const editing = ref<ProjectDto | null>(null)
const confirmOpen = ref(false)
const deleting = ref<ProjectDto | null>(null)

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(project: ProjectDto) {
  editing.value = project
  formOpen.value = true
}

async function handleSubmit(input: CreateProjectInput) {
  if (editing.value) {
    await updateProject(editing.value.id, input)
    toast.success('Project updated')
  } else {
    await createProject(input)
    toast.success('Project created')
  }
}

function confirmRemove(project: ProjectDto) {
  deleting.value = project
  confirmOpen.value = true
}

async function handleRemove() {
  if (!deleting.value) return
  try {
    await removeProject(deleting.value.id)
    toast.success('Project deleted')
  } catch (cause) {
    toast.error(getApiMessage(cause, 'Could not delete project'))
  } finally {
    confirmOpen.value = false
    deleting.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Projects</h1>
        <p class="text-sm text-muted-foreground">Organise your work into projects.</p>
      </div>
      <Button @click="openCreate">
        <Plus class="size-4" />
        New project
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="n in 6" :key="n" class="h-36 rounded-xl" />
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center"
    >
      <p class="text-sm text-destructive">Could not load projects.</p>
      <Button variant="outline" size="sm" class="mt-3" @click="() => refresh()">Try again</Button>
    </div>

    <!-- Empty -->
    <div v-else-if="projects.length === 0" class="rounded-xl border border-dashed p-12 text-center">
      <FolderPlus class="mx-auto size-8 text-muted-foreground" />
      <h2 class="mt-3 font-medium">No projects yet</h2>
      <p class="mt-1 text-sm text-muted-foreground">Create your first project to get started.</p>
      <Button class="mt-4" @click="openCreate">
        <Plus class="size-4" />
        New project
      </Button>
    </div>

    <!-- List -->
    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
          @edit="openEdit"
          @remove="confirmRemove"
        />
      </div>

      <div
        v-if="pagination && pagination.totalPages > 1"
        class="flex items-center justify-center gap-3"
      >
        <Button variant="outline" size="sm" :disabled="page <= 1" @click="page--">Previous</Button>
        <span class="text-sm text-muted-foreground">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="page >= pagination.totalPages"
          @click="page++"
        >
          Next
        </Button>
      </div>
    </template>

    <ProjectFormDialog v-model:open="formOpen" :project="editing" :on-submit="handleSubmit" />

    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Delete project?"
      :description="`“${deleting?.name}” and all its tasks will be permanently deleted.`"
      @confirm="handleRemove"
    />
  </div>
</template>
