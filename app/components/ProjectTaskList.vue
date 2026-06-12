<script setup lang="ts">
import { MoreHorizontal, Pencil, Plus, Trash2 } from '@lucide/vue'
import { type TaskStatus, TASK_STATUS_LABELS, TASK_STATUSES } from '#shared/constants/task-status'
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

// Presentational: the page owns the data and mutations, this component only
// renders the task list and reports intent back through events.
defineProps<{
  tasks: TaskDto[]
  pending: boolean
  failed: boolean
  status: TaskStatus | ''
}>()

const emit = defineEmits<{
  'update:status': [TaskStatus | '']
  create: []
  edit: [TaskDto]
  remove: [TaskDto]
  changeStatus: [task: TaskDto, status: TaskStatus]
}>()

// '' is the "all" pseudo-filter; the real statuses follow it.
const statusFilters = [
  { value: '', label: 'All' },
  ...TASK_STATUSES.map((value) => ({ value, label: TASK_STATUS_LABELS[value] })),
] as const
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-1 rounded-lg border p-0.5">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          type="button"
          class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
          :class="
            status === filter.value
              ? 'bg-secondary text-secondary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="emit('update:status', filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
      <Button size="sm" variant="outline" @click="emit('create')">
        <Plus class="size-4" />
        Add task
      </Button>
    </div>

    <div v-if="pending" class="space-y-2">
      <Skeleton v-for="n in 3" :key="n" class="h-14 rounded-lg" />
    </div>

    <p v-else-if="failed" class="text-sm text-destructive">Could not load tasks.</p>

    <div
      v-else-if="tasks.length === 0"
      class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground"
    >
      {{ status ? 'No tasks with this status.' : 'No tasks yet. Add the first one.' }}
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="flex items-center gap-3 rounded-lg border p-3"
      >
        <Select
          :model-value="task.status"
          @update:model-value="(value) => emit('changeStatus', task, value as TaskStatus)"
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
            <DropdownMenuItem class="cursor-pointer" @click="emit('edit', task)">
              <Pencil class="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem class="cursor-pointer text-destructive" @click="emit('remove', task)">
              <Trash2 class="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    </ul>
  </section>
</template>
