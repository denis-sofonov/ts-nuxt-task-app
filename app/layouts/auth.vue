<script setup lang="ts">
const {
  public: { appName },
} = useRuntimeConfig()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-muted/30">
    <header class="px-6 py-5">
      <NuxtLink to="/" class="inline-flex items-center gap-2 font-semibold tracking-tight">
        <span class="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
          {{ appName.charAt(0) }}
        </span>
        {{ appName }}
      </NuxtLink>
    </header>

    <main class="flex flex-1 items-center justify-center px-6 pb-16">
      <div class="w-full max-w-sm">
        <slot />
      </div>
    </main>
  </div>
</template>
