<script setup lang="ts">
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { type TaskStatus, TASK_STATUS_LABELS, TASK_STATUSES } from '#shared/constants/task-status'
import { type CreateTaskInput, createTaskSchema } from '#shared/schemas/task'
import type { TaskDto } from '#shared/types/domain'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  open: boolean
  task?: TaskDto | null
  onSubmit: (input: CreateTaskInput) => Promise<void>
}>()

const emit = defineEmits<{ 'update:open': [boolean] }>()

const isEdit = computed(() => Boolean(props.task))
const title = ref('')
const description = ref('')
const status = ref<TaskStatus>('todo')
const errors = ref<Record<string, string[] | undefined>>({})
const submitting = ref(false)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    title.value = props.task?.title ?? ''
    description.value = props.task?.description ?? ''
    status.value = props.task?.status ?? 'todo'
    errors.value = {}
  },
)

async function handleSubmit() {
  const parsed = createTaskSchema.safeParse({
    title: title.value,
    description: description.value || null,
    status: status.value,
  })
  if (!parsed.success) {
    errors.value = z.flattenError(parsed.error).fieldErrors
    return
  }

  submitting.value = true
  try {
    await props.onSubmit(parsed.data)
    emit('update:open', false)
  } catch (error) {
    errors.value = getFieldErrors(error)
    toast.error(getApiMessage(error, 'Could not save task'))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Edit task' : 'New task' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Update the task details.' : 'Add a task to this project.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-1.5">
          <Label for="task-title">Title</Label>
          <Input
            id="task-title"
            v-model="title"
            placeholder="Write the docs"
            :aria-invalid="Boolean(errors.title)"
          />
          <p v-if="errors.title" class="text-xs text-destructive">{{ errors.title[0] }}</p>
        </div>

        <div class="space-y-1.5">
          <Label for="task-description">Description</Label>
          <Textarea id="task-description" v-model="description" rows="3" placeholder="Optional" />
        </div>

        <div class="space-y-1.5">
          <Label>Status</Label>
          <Select v-model="status">
            <SelectTrigger class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="value in TASK_STATUSES" :key="value" :value="value">
                {{ TASK_STATUS_LABELS[value] }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" @click="emit('update:open', false)">Cancel</Button>
          <Button type="submit" :disabled="submitting">
            {{ isEdit ? 'Save changes' : 'Create task' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
