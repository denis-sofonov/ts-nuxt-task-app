<script setup lang="ts">
// Skeleton landing screen. Real routing (pages/, layouts/) and shadcn-vue
// components arrive with the frontend stage; for now this proves SSR, the
// runtime config and the custom Tailwind theme are wired up correctly.
import { CircleCheckBig } from 'lucide-vue-next'

const config = useRuntimeConfig()
const appName = config.public.appName

useHead({
  title: appName,
  meta: [{ name: 'description', content: 'A task manager built with Nuxt 4 and Nitro.' }],
})

const stack = ['Nuxt 4', 'Nitro', 'TypeScript', 'Drizzle ORM', 'PostgreSQL', 'Tailwind v4']
</script>

<template>
  <div class="min-h-screen bg-background">
    <main class="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p class="text-sm font-medium tracking-wide text-primary uppercase">{{ appName }}</p>
      <h1 class="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        One task domain, many stacks.
      </h1>
      <p class="mt-4 max-w-xl text-lg text-muted-foreground">
        A full-stack reference implementation of the same projects-and-tasks API that powers the
        sibling Laravel and FastAPI services — here built end to end on Nuxt and Nitro.
      </p>

      <ul class="mt-8 flex flex-wrap gap-2">
        <li
          v-for="item in stack"
          :key="item"
          class="rounded-full border border-border bg-card px-3 py-1 text-sm text-card-foreground"
        >
          {{ item }}
        </li>
      </ul>

      <p class="mt-10 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <CircleCheckBig class="size-4 text-primary" />
        Project skeleton ready.
      </p>
    </main>
  </div>
</template>
