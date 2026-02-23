export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return

  const { isAuthenticated } = useAuth()
  const publicPages = ['/login', '/register']
  const isPublic = publicPages.includes(to.path)

  if (!isAuthenticated.value && !isPublic) {
    return navigateTo('/login')
  }

  if (isAuthenticated.value && isPublic) {
    return navigateTo('/')
  }
})
