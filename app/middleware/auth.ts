// Route middleware for pages that require an authenticated user. Opt in per page
// with `definePageMeta({ middleware: 'auth' })`. Runs on both server and client
// so a direct SSR hit to a protected URL also redirects.
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
