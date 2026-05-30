<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'

const {
  public: { appName },
} = useRuntimeConfig()

useHead({
  titleTemplate: (title) => (title ? `${title} · ${appName}` : appName),
  htmlAttrs: { lang: 'en' },
  meta: [{ name: 'description', content: 'A task manager built with Nuxt 4 and Nitro.' }],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster position="top-right" :duration="3500" />
</template>
