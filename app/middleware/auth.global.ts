export default defineNuxtRouteMiddleware(async (to) => {
  // Skip during SSR to avoid server-side fetch issues
  if (import.meta.server) return

  try {
    const session = await $fetch('/api/auth/session')

    if (!session.loggedIn && to.path !== '/login' && to.path !== '/register') {
      return navigateTo('/login')
    }

    if (session.loggedIn && (to.path === '/login' || to.path === '/register')) {
      return navigateTo('/')
    }
  } catch {
    // If session check fails, redirect to login
    if (to.path !== '/login' && to.path !== '/register') {
      return navigateTo('/login')
    }
  }
})
