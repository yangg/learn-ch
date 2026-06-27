export default defineEventHandler((event) => {
  const session = getAppSession(event)

  return {
    loggedIn: !!session,
    user: session ? { id: session.userId } : undefined
  }
})
