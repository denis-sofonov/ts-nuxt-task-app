<script setup lang="ts">
import { z } from 'zod'
import { registerSchema } from '#shared/schemas/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Create account' })

const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const errors = ref<Record<string, string[] | undefined>>({})
const formError = ref('')
const submitting = ref(false)

async function handleSubmit() {
  errors.value = {}
  formError.value = ''

  const parsed = registerSchema.safeParse({
    name: name.value,
    email: email.value,
    password: password.value,
  })
  if (!parsed.success) {
    errors.value = z.flattenError(parsed.error).fieldErrors
    return
  }

  submitting.value = true
  try {
    await auth.register(parsed.data)
    await navigateTo('/projects')
  } catch (error) {
    errors.value = getFieldErrors(error)
    formError.value = getApiMessage(error, 'Unable to create account')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-xl">Create your account</CardTitle>
      <CardDescription>Start organising your projects and tasks.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
        <div class="space-y-1.5">
          <Label for="name">Name</Label>
          <Input
            id="name"
            v-model="name"
            autocomplete="name"
            placeholder="Ada Lovelace"
            :aria-invalid="Boolean(errors.name)"
          />
          <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name[0] }}</p>
        </div>

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
          <Label for="password">Password</Label>
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
          {{ submitting ? 'Creating account…' : 'Create account' }}
        </Button>
      </form>

      <p class="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?
        <NuxtLink
          to="/login"
          class="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </NuxtLink>
      </p>
    </CardContent>
  </Card>
</template>
