<script setup lang="ts">
import type { NuxtError } from '#app'
import { Button } from '@/components/ui/button'

// Nuxt renders this for any error that escapes a page — a thrown `createError`
// during SSR, a failed route, or an uncaught client error. It replaces the
// whole app, so it brings its own minimal chrome rather than a layout.
const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() => (isNotFound.value ? 'Page not found' : 'Something went wrong'))
const description = computed(() =>
  isNotFound.value
    ? 'The page you’re looking for doesn’t exist or has moved.'
    : 'An unexpected error occurred. Please try again.',
)

useHead({ title })

// `clearError` resets the error state; the redirect navigates away from the
// route that failed so the app re-renders cleanly.
function handleReset() {
  clearError({ redirect: '/projects' })
}
</script>

<template>
  <div class="grid min-h-screen place-items-center px-6">
    <div class="w-full max-w-md text-center">
      <p class="text-sm font-medium text-muted-foreground">{{ error.statusCode }}</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight">{{ title }}</h1>
      <p class="mt-2 text-sm text-muted-foreground">{{ description }}</p>
      <Button class="mt-6" @click="handleReset">Back to projects</Button>
    </div>
  </div>
</template>
