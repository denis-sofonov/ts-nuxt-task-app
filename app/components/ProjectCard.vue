<script setup lang="ts">
import { MoreHorizontal, Pencil, Trash2 } from '@lucide/vue'
import type { ProjectDto } from '#shared/types/domain'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const props = defineProps<{ project: ProjectDto }>()
const emit = defineEmits<{ edit: [ProjectDto]; remove: [ProjectDto] }>()

const createdAt = computed(() =>
  new Date(props.project.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
)
</script>

<template>
  <Card class="group relative transition-colors hover:border-primary/40">
    <CardHeader class="flex flex-row items-start justify-between gap-2 space-y-0">
      <NuxtLink :to="`/projects/${project.id}`" class="min-w-0">
        <h3 class="truncate font-medium tracking-tight after:absolute after:inset-0">
          {{ project.name }}
        </h3>
      </NuxtLink>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            class="relative z-10 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
            @click.stop.prevent
          >
            <MoreHorizontal class="size-4" />
            <span class="sr-only">Project actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-40">
          <DropdownMenuItem class="cursor-pointer" @click="emit('edit', project)">
            <Pencil class="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            class="cursor-pointer text-destructive"
            @click="emit('remove', project)"
          >
            <Trash2 class="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>

    <CardContent>
      <p class="line-clamp-2 text-sm text-muted-foreground">
        {{ project.description || 'No description' }}
      </p>
    </CardContent>

    <CardFooter>
      <span class="text-xs text-muted-foreground">Created {{ createdAt }}</span>
    </CardFooter>
  </Card>
</template>
