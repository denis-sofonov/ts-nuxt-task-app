<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { Button } from '@/components/ui/button'

definePageMeta({ layout: false })

const { loggedIn } = useUserSession()
const {
  public: { appName },
} = useRuntimeConfig()

// Authenticated visitors go straight to the app (handled during SSR).
if (loggedIn.value) {
  await navigateTo('/projects')
}

const stack = ['Nuxt 4', 'Nitro', 'TypeScript', 'Drizzle ORM', 'PostgreSQL', 'Tailwind v4']
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
      <span class="inline-flex items-center gap-2 font-semibold tracking-tight">
        <span class="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
          {{ appName.charAt(0) }}
        </span>
        {{ appName }}
      </span>
      <div class="flex items-center gap-2">
        <Button variant="ghost" as-child>
          <NuxtLink to="/login">Sign in</NuxtLink>
        </Button>
        <Button as-child>
          <NuxtLink to="/register">Get started</NuxtLink>
        </Button>
      </div>
    </header>

    <main class="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
      <p class="text-sm font-medium tracking-wide text-primary uppercase">{{ appName }}</p>
      <h1 class="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Organise projects and tasks, one stack at a time.
      </h1>
      <p class="mt-4 max-w-xl text-lg text-muted-foreground">
        A full-stack reference implementation of the same projects-and-tasks domain that powers the
        sibling Laravel and FastAPI services — here built end to end on Nuxt and Nitro.
      </p>

      <div class="mt-8">
        <Button size="lg" as-child>
          <NuxtLink to="/register">
            Create an account
            <ArrowRight class="size-4" />
          </NuxtLink>
        </Button>
      </div>

      <ul class="mt-12 flex flex-wrap gap-2">
        <li
          v-for="item in stack"
          :key="item"
          class="rounded-full border bg-card px-3 py-1 text-sm text-card-foreground"
        >
          {{ item }}
        </li>
      </ul>
    </main>
  </div>
</template>
