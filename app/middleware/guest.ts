// Keep authenticated users away from the login/register pages.
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  if (loggedIn.value) {
    return navigateTo('/projects')
  }
})
