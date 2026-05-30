<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Profile' })

const auth = useAuthStore()
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
          <p class="text-sm font-medium">{{ auth.currentUser?.name }}</p>
        </div>
        <div class="space-y-0.5">
          <p class="text-xs text-muted-foreground">Email</p>
          <p class="text-sm font-medium">{{ auth.currentUser?.email }}</p>
        </div>
      </CardContent>
    </Card>

    <Button variant="outline" @click="auth.logout()">Sign out</Button>
  </div>
</template>
