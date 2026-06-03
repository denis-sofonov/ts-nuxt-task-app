<script setup lang="ts">
import { z } from 'zod'
import { loginSchema } from '#shared/schemas/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Sign in' })

const auth = useAuthStore()
const route = useRoute()

const email = ref('')
const password = ref('')
const errors = ref<Record<string, string[] | undefined>>({})
const formError = ref('')
const submitting = ref(false)

async function handleSubmit() {
  errors.value = {}
  formError.value = ''

  const parsed = loginSchema.safeParse({ email: email.value, password: password.value })
  if (!parsed.success) {
    errors.value = z.flattenError(parsed.error).fieldErrors
    return
  }

  submitting.value = true
  try {
    await auth.login(parsed.data)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/projects'
    await navigateTo(redirect)
  } catch (error) {
    errors.value = getFieldErrors(error)
    formError.value = getApiMessage(error, 'Unable to sign in')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-xl">Welcome back</CardTitle>
      <CardDescription>Sign in to continue to your projects.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
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

        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <Label for="password">Password</Label>
            <NuxtLink
              to="/forgot-password"
              class="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </NuxtLink>
          </div>
          <Input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            :aria-invalid="Boolean(errors.password)"
          />
          <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password[0] }}</p>
        </div>

        <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>

        <Button type="submit" class="w-full" :disabled="submitting">
          {{ submitting ? 'Signing in…' : 'Sign in' }}
        </Button>
      </form>

      <p class="mt-6 text-center text-sm text-muted-foreground">
        No account?
        <NuxtLink
          to="/register"
          class="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create one
        </NuxtLink>
      </p>
    </CardContent>
  </Card>
</template>
