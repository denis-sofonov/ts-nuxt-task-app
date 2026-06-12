<script setup lang="ts">
import { ArrowLeft, MoreHorizontal, Pencil, Trash2 } from '@lucide/vue'
import { toast } from 'vue-sonner'
import type { TaskStatus } from '#shared/constants/task-status'
import type { CreateProjectInput } from '#shared/schemas/project'
import type { CreateTaskInput } from '#shared/schemas/task'
import type { TaskDto } from '#shared/types/domain'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const projectId = route.params.id as string

const {
  project,
  pending: projectPending,
  error: projectError,
  updateProject,
  removeProject,
} = useProject(projectId)

const {
  tasks,
  status: statusFilter,
  pending: tasksPending,
  error: tasksError,
  createTask,
  updateTask,
  removeTask,
} = useProjectTasks(projectId)

useHead(() => ({ title: project.value?.name ?? 'Project' }))

// Error handling is split by intent: form submits surface validation/server
// errors inside the dialog (it owns the fields), so the handlers below let
// those rejections propagate. Destructive and inline actions have no form to
// catch them, so they report failures with a toast here.

const projectFormOpen = ref(false)
const confirmProjectOpen = ref(false)

async function handleProjectSubmit(input: CreateProjectInput) {
  await updateProject(input)
  toast.success('Project updated')
}

async function handleProjectRemove() {
  try {
    await removeProject()
    toast.success('Project deleted')
    await navigateTo('/projects')
  } catch (cause) {
    toast.error(getApiMessage(cause, 'Could not delete project'))
  } finally {
    confirmProjectOpen.value = false
  }
}

const taskFormOpen = ref(false)
const editingTask = ref<TaskDto | null>(null)

function openCreateTask() {
  editingTask.value = null
  taskFormOpen.value = true
}

function openEditTask(task: TaskDto) {
  editingTask.value = task
  taskFormOpen.value = true
}

async function handleTaskSubmit(input: CreateTaskInput) {
  if (editingTask.value) {
    await updateTask(editingTask.value.id, input)
    toast.success('Task updated')
  } else {
    await createTask(input)
    toast.success('Task added')
  }
}

const confirmTaskOpen = ref(false)
const deletingTask = ref<TaskDto | null>(null)

function confirmRemoveTask(task: TaskDto) {
  deletingTask.value = task
  confirmTaskOpen.value = true
}

async function handleTaskRemove() {
  if (!deletingTask.value) return
  try {
    await removeTask(deletingTask.value.id)
    toast.success('Task deleted')
  } catch (cause) {
    toast.error(getApiMessage(cause, 'Could not delete task'))
  } finally {
    confirmTaskOpen.value = false
    deletingTask.value = null
  }
}

async function changeStatus(task: TaskDto, status: TaskStatus) {
  if (status === task.status) return
  try {
    await updateTask(task.id, { status })
  } catch (cause) {
    toast.error(getApiMessage(cause, 'Could not update status'))
  }
}
</script>

<template>
  <div class="space-y-6">
    <NuxtLink
      to="/projects"
      class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft class="size-4" />
      Projects
    </NuxtLink>

    <Skeleton v-if="projectPending" class="h-20 rounded-xl" />

    <div
      v-else-if="projectError || !project"
      class="rounded-xl border border-dashed p-12 text-center"
    >
      <h1 class="font-medium">Project not found</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        It may have been deleted, or you don’t have access to it.
      </p>
      <Button variant="outline" class="mt-4" as-child>
        <NuxtLink to="/projects">Back to projects</NuxtLink>
      </Button>
    </div>

    <template v-else>
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold tracking-tight">{{ project.name }}</h1>
          <p v-if="project.description" class="mt-1 text-sm text-muted-foreground">
            {{ project.description }}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon">
              <MoreHorizontal class="size-4" />
              <span class="sr-only">Project actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-40">
            <DropdownMenuItem class="cursor-pointer" @click="projectFormOpen = true">
              <Pencil class="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              class="cursor-pointer text-destructive"
              @click="confirmProjectOpen = true"
            >
              <Trash2 class="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProjectTaskList
        :tasks="tasks"
        :pending="tasksPending"
        :failed="Boolean(tasksError)"
        :status="statusFilter"
        @update:status="statusFilter = $event"
        @create="openCreateTask"
        @edit="openEditTask"
        @remove="confirmRemoveTask"
        @change-status="changeStatus"
      />

      <ProjectFormDialog
        v-model:open="projectFormOpen"
        :project="project"
        :on-submit="handleProjectSubmit"
      />
      <TaskFormDialog
        v-model:open="taskFormOpen"
        :task="editingTask"
        :on-submit="handleTaskSubmit"
      />

      <ConfirmDialog
        v-model:open="confirmProjectOpen"
        title="Delete project?"
        :description="`“${project.name}” and all its tasks will be permanently deleted.`"
        @confirm="handleProjectRemove"
      />
      <ConfirmDialog
        v-model:open="confirmTaskOpen"
        title="Delete task?"
        :description="`“${deletingTask?.title}” will be permanently deleted.`"
        @confirm="handleTaskRemove"
      />
    </template>
  </div>
</template>
