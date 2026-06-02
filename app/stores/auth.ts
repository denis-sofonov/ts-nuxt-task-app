import type { LoginInput, RegisterInput } from '#shared/schemas/auth'

/**
 * Thin Pinia wrapper over the nuxt-auth-utils session. The sealed cookie remains
 * the source of truth; this store exposes the auth actions and a reactive view
 * of the current user so components never call the auth endpoints directly.
 */
export const useAuthStore = defineStore('auth', () => {
  const { loggedIn, user, fetch: refreshSession, clear } = useUserSession()

  const isAuthenticated = computed(() => loggedIn.value)
  const currentUser = computed(() => user.value)

  async function login(credentials: LoginInput) {
    await $fetch('/api/v1/auth/login', { method: 'POST', body: credentials })
    await refreshSession()
  }

  async function register(input: RegisterInput) {
    await $fetch('/api/v1/auth/register', { method: 'POST', body: input })
    await refreshSession()
  }

  async function logout() {
    await $fetch('/api/v1/auth/logout', { method: 'POST' })
    await clear()
    await navigateTo('/login')
  }

  return { isAuthenticated, currentUser, login, register, logout }
})
