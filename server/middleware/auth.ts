export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  // Only protect /api/ routes
  if (!path.startsWith('/api/')) return

  // Skip auth endpoints
  if (path === '/api/auth/login' || path === '/api/auth/session') return

  const session = getSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Attach userId to event context for downstream handlers
  event.context.userId = session.userId
})
