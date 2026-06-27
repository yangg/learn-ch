export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string
  const sql = useDb()

  const [user] = await sql`
    SELECT batch_size, nickname FROM users WHERE id = ${userId}
  `

  return {
    batchSize: user?.batch_size ?? 20,
    nickname: user?.nickname ?? ''
  }
})
