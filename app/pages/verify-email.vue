<script setup lang="ts">
import { CircleCheckBig, CircleX, Loader } from '@lucide/vue'
import { Button } from '@/components/ui/button'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Verify email' })

const route = useRoute()
const { loggedIn } = useUserSession()

const state = ref<'pending' | 'success' | 'error'>('pending')

onMounted(async () => {
  const token = String(route.query.token ?? '')
  if (!token) {
    state.value = 'error'
    return
  }
  try {
    await $fetch('/api/v1/auth/verify-email', { method: 'POST', body: { token } })
    state.value = 'success'
  } catch {
    state.value = 'error'
  }
})
</script>

<template>
  <div class="space-y-4 text-center">
    <template v-if="state === 'pending'">
      <Loader class="mx-auto size-8 animate-spin text-muted-foreground" />
      <p class="text-sm text-muted-foreground">Verifying your email…</p>
    </template>

    <template v-else-if="state === 'success'">
      <CircleCheckBig class="mx-auto size-8 text-emerald-500" />
      <h1 class="text-lg font-semibold">Email verified</h1>
      <p class="text-sm text-muted-foreground">Your email address is now confirmed.</p>
      <Button as-child>
        <NuxtLink :to="loggedIn ? '/projects' : '/login'">Continue</NuxtLink>
      </Button>
    </template>

    <template v-else>
      <CircleX class="mx-auto size-8 text-destructive" />
      <h1 class="text-lg font-semibold">Verification failed</h1>
      <p class="text-sm text-muted-foreground">This link is invalid or has expired.</p>
      <Button variant="outline" as-child>
        <NuxtLink :to="loggedIn ? '/profile' : '/login'">
          {{ loggedIn ? 'Back to profile' : 'Back to sign in' }}
        </NuxtLink>
      </Button>
    </template>
  </div>
</template>
