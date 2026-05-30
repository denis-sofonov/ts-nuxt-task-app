<script setup lang="ts">
import { type TaskStatus, TASK_STATUS_LABELS } from '#shared/constants/task-status'

const props = defineProps<{ status: TaskStatus }>()

// Colour lives in the UI layer; labels come from the shared constant.
const dotClass: Record<TaskStatus, string> = {
  todo: 'bg-muted-foreground',
  in_progress: 'bg-amber-500',
  done: 'bg-emerald-500',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap"
  >
    <span class="size-1.5 rounded-full" :class="dotClass[props.status]" />
    {{ TASK_STATUS_LABELS[props.status] }}
  </span>
</template>
