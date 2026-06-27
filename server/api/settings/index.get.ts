export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string
  const sql = useDb()

  const [settings] = await sql`
    SELECT batch_size FROM user_settings WHERE user_id = ${userId}
  `

  return {
    batchSize: settings?.batch_size ?? 20
  }
})
