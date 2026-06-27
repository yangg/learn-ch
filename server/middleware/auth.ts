export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  // Only protect /api/ routes
  if (!path.startsWith('/api/')) return

  // Skip auth endpoints
  if (path === '/api/auth/login' || path === '/api/auth/session' || path === '/api/auth/register') return

  const session = getAppSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Attach userId to event context for downstream handlers
  event.context.userId = Number(session.userId)
})
