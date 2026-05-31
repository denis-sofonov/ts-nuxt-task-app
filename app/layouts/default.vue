<script setup lang="ts">
import { LogOut, User } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const {
  public: { appName },
} = useRuntimeConfig()

const auth = useAuthStore()

const initials = computed(() => {
  const name = auth.currentUser?.name ?? ''
  return (
    name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  )
})

const navLinks = [{ label: 'Projects', to: '/projects' }]
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <div class="flex items-center gap-6">
          <NuxtLink
            to="/projects"
            class="inline-flex items-center gap-2 font-semibold tracking-tight"
          >
            <span
              class="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground"
            >
              {{ appName.charAt(0) }}
            </span>
            {{ appName }}
          </NuxtLink>
          <nav class="hidden items-center gap-1 sm:flex">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              active-class="text-foreground"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="rounded-full" aria-label="Account menu">
              <span class="text-xs font-medium">{{ initials }}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuLabel class="flex flex-col">
              <span class="font-medium">{{ auth.currentUser?.name }}</span>
              <span class="text-xs font-normal text-muted-foreground">
                {{ auth.currentUser?.email }}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem as-child>
              <NuxtLink to="/profile" class="cursor-pointer">
                <User class="size-4" />
                Profile
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem class="cursor-pointer text-destructive" @select="auth.logout()">
              <LogOut class="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <slot />
    </main>
  </div>
</template>
