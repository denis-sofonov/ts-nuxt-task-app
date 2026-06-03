<script setup lang="ts">
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { resetPasswordSchema } from '#shared/schemas/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Choose a new password' })

const route = useRoute()
const token = String(route.query.token ?? '')

const password = ref('')
const errors = ref<Record<string, string[] | undefined>>({})
const formError = ref('')
const submitting = ref(false)

async function handleSubmit() {
  errors.value = {}
  formError.value = ''

  const parsed = resetPasswordSchema.safeParse({ token, password: password.value })
  if (!parsed.success) {
    errors.value = z.flattenError(parsed.error).fieldErrors
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/v1/auth/reset-password', { method: 'POST', body: parsed.data })
    toast.success('Password updated — sign in with your new password.')
    await navigateTo('/login')
  } catch (error) {
    formError.value = getApiMessage(error, 'This reset link is invalid or has expired.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-xl">Choose a new password</CardTitle>
      <CardDescription>Enter a new password for your account.</CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="!token" class="text-sm text-destructive">
        This reset link is missing its token. Request a new one from the
        <NuxtLink to="/forgot-password" class="underline">forgot password</NuxtLink> page.
      </div>

      <form v-else class="space-y-4" novalidate @submit.prevent="handleSubmit">
        <div class="space-y-1.5">
          <Label for="password">New password</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            :aria-invalid="Boolean(errors.password)"
          />
          <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password[0] }}</p>
        </div>
        <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
        <Button type="submit" class="w-full" :disabled="submitting">
          {{ submitting ? 'Updating…' : 'Update password' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
