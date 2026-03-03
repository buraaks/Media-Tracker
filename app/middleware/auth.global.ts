export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return

  const { isAuthenticated, isGuest } = useAuth()
  const publicPages = ['/', '/login', '/register']
  const isPublic = publicPages.includes(to.path)

  if (!isAuthenticated.value && !isGuest.value && !isPublic) {
    return navigateTo('/login')
  }

  if (isAuthenticated.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/tracker')
  }
})
