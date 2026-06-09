<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Profile' })

const auth = useAuthStore()
const { data } = await useFetch('/api/v1/auth/me')
const profile = computed(() => data.value?.user ?? null)
const verified = computed(() => Boolean(profile.value?.emailVerifiedAt))

// Cached server-side (see /api/v1/stats); a short staleness window is fine here.
const { data: stats } = await useFetch('/api/v1/stats')

const resending = ref(false)
async function resendVerification() {
  resending.value = true
  try {
    await $fetch('/api/v1/auth/resend-verification', { method: 'POST' })
    toast.success('Verification email sent — check your inbox.')
  } catch (error) {
    toast.error(getApiMessage(error, 'Could not send the email'))
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-md space-y-6">
    <h1 class="text-2xl font-semibold tracking-tight">Profile</h1>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Account</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-0.5">
          <p class="text-xs text-muted-foreground">Name</p>
          <p class="text-sm font-medium">{{ profile?.name ?? auth.currentUser?.name }}</p>
        </div>

        <div class="space-y-0.5">
          <p class="text-xs text-muted-foreground">Email</p>
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium">{{ profile?.email ?? auth.currentUser?.email }}</p>
            <span
              class="rounded-full border px-2 py-0.5 text-xs font-medium"
              :class="
                verified
                  ? 'border-emerald-500/30 text-emerald-600'
                  : 'border-amber-500/30 text-amber-600'
              "
            >
              {{ verified ? 'Verified' : 'Unverified' }}
            </span>
          </div>
        </div>

        <div v-if="!verified" class="rounded-lg bg-muted/50 p-3">
          <p class="text-xs text-muted-foreground">
            Confirm your email address to secure your account.
          </p>
          <Button
            variant="outline"
            size="sm"
            class="mt-2"
            :disabled="resending"
            @click="resendVerification"
          >
            {{ resending ? 'Sending…' : 'Resend verification email' }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card v-if="stats">
      <CardHeader>
        <CardTitle class="text-base">Workspace</CardTitle>
      </CardHeader>
      <CardContent class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-2xl font-semibold">{{ stats.projects }}</p>
          <p class="text-xs text-muted-foreground">Projects</p>
        </div>
        <div>
          <p class="text-2xl font-semibold">{{ stats.tasks }}</p>
          <p class="text-xs text-muted-foreground">Tasks</p>
        </div>
      </CardContent>
    </Card>

    <Button variant="outline" @click="auth.logout()">Sign out</Button>
  </div>
</template>
