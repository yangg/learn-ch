export default defineEventHandler(async (event) => {
  const session = getAppSession(event)

  if (!session) {
    return { loggedIn: false }
  }

  const sql = useDb()
  const [user] = await sql`
    SELECT id, username FROM users WHERE id = ${session.userId}
  `

  if (!user) {
    return { loggedIn: false }
  }

  return {
    loggedIn: true,
    user: { id: user.id, username: user.username }
  }
})
