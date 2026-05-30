<script setup lang="ts">
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { type CreateProjectInput, createProjectSchema } from '#shared/schemas/project'
import type { ProjectDto } from '#shared/types/domain'
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
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  open: boolean
  project?: ProjectDto | null
  // Parent owns the API call so this dialog stays reusable for create and edit.
  onSubmit: (input: CreateProjectInput) => Promise<void>
}>()

const emit = defineEmits<{ 'update:open': [boolean] }>()

const isEdit = computed(() => Boolean(props.project))
const name = ref('')
const description = ref('')
const errors = ref<Record<string, string[] | undefined>>({})
const submitting = ref(false)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    name.value = props.project?.name ?? ''
    description.value = props.project?.description ?? ''
    errors.value = {}
  },
)

async function handleSubmit() {
  const parsed = createProjectSchema.safeParse({
    name: name.value,
    description: description.value || null,
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
    toast.error(getApiMessage(error, 'Could not save project'))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Edit project' : 'New project' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Update the project details.' : 'Group related tasks under a project.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-1.5">
          <Label for="project-name">Name</Label>
          <Input
            id="project-name"
            v-model="name"
            placeholder="Website redesign"
            :aria-invalid="Boolean(errors.name)"
          />
          <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name[0] }}</p>
        </div>

        <div class="space-y-1.5">
          <Label for="project-description">Description</Label>
          <Textarea
            id="project-description"
            v-model="description"
            rows="3"
            placeholder="Optional"
            :aria-invalid="Boolean(errors.description)"
          />
          <p v-if="errors.description" class="text-xs text-destructive">
            {{ errors.description[0] }}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" @click="emit('update:open', false)">Cancel</Button>
          <Button type="submit" :disabled="submitting">
            {{ isEdit ? 'Save changes' : 'Create project' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
