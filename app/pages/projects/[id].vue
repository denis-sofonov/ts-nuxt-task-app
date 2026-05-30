<script setup lang="ts">
import { ArrowLeft, MoreHorizontal, Pencil, Plus, Trash2 } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { type TaskStatus, TASK_STATUS_LABELS, TASK_STATUSES } from '#shared/constants/task-status'
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
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
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
  pending: tasksPending,
  error: tasksError,
  createTask,
  updateTask,
  removeTask,
} = useProjectTasks(projectId)

useHead(() => ({ title: project.value?.name ?? 'Project' }))

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

      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-medium text-muted-foreground">
            Tasks <span v-if="!tasksPending">· {{ tasks.length }}</span>
          </h2>
          <Button size="sm" variant="outline" @click="openCreateTask">
            <Plus class="size-4" />
            Add task
          </Button>
        </div>

        <div v-if="tasksPending" class="space-y-2">
          <Skeleton v-for="n in 3" :key="n" class="h-14 rounded-lg" />
        </div>

        <p v-else-if="tasksError" class="text-sm text-destructive">Could not load tasks.</p>

        <div
          v-else-if="tasks.length === 0"
          class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground"
        >
          No tasks yet. Add the first one.
        </div>

        <ul v-else class="space-y-2">
          <li
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center gap-3 rounded-lg border p-3"
          >
            <Select
              :model-value="task.status"
              @update:model-value="(value) => changeStatus(task, value as TaskStatus)"
            >
              <SelectTrigger
                class="h-auto w-auto gap-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              >
                <StatusBadge :status="task.status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="value in TASK_STATUSES" :key="value" :value="value">
                  {{ TASK_STATUS_LABELS[value] }}
                </SelectItem>
              </SelectContent>
            </Select>

            <div class="min-w-0 flex-1">
              <p
                class="truncate text-sm font-medium"
                :class="task.status === 'done' && 'text-muted-foreground line-through'"
              >
                {{ task.title }}
              </p>
              <p v-if="task.description" class="truncate text-xs text-muted-foreground">
                {{ task.description }}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal class="size-4" />
                  <span class="sr-only">Task actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-40">
                <DropdownMenuItem class="cursor-pointer" @click="openEditTask(task)">
                  <Pencil class="size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  class="cursor-pointer text-destructive"
                  @click="confirmRemoveTask(task)"
                >
                  <Trash2 class="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        </ul>
      </section>

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
