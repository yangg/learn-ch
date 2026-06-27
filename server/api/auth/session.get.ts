export default defineEventHandler((event) => {
  const session = getSession(event)

  return {
    loggedIn: !!session,
    user: session ? { id: session.userId } : undefined
  }
})
