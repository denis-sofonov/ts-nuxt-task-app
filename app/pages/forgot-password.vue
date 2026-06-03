<script setup lang="ts">
import { z } from 'zod'
import { forgotPasswordSchema } from '#shared/schemas/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Forgot password' })

const email = ref('')
const errors = ref<Record<string, string[] | undefined>>({})
const submitting = ref(false)
const sent = ref(false)

async function handleSubmit() {
  errors.value = {}
  const parsed = forgotPasswordSchema.safeParse({ email: email.value })
  if (!parsed.success) {
    errors.value = z.flattenError(parsed.error).fieldErrors
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/v1/auth/forgot-password', { method: 'POST', body: parsed.data })
    sent.value = true
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-xl">Reset your password</CardTitle>
      <CardDescription>We’ll email you a link to choose a new one.</CardDescription>
    </CardHeader>
    <CardContent>
      <p v-if="sent" class="text-sm text-muted-foreground">
        If an account exists for that address, a reset link is on its way.
      </p>

      <form v-else class="space-y-4" novalidate @submit.prevent="handleSubmit">
        <div class="space-y-1.5">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            :aria-invalid="Boolean(errors.email)"
          />
          <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email[0] }}</p>
        </div>
        <Button type="submit" class="w-full" :disabled="submitting">
          {{ submitting ? 'Sending…' : 'Send reset link' }}
        </Button>
      </form>

      <p class="mt-6 text-center text-sm text-muted-foreground">
        <NuxtLink
          to="/login"
          class="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </NuxtLink>
      </p>
    </CardContent>
  </Card>
</template>
