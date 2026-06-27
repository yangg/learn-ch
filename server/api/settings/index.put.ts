export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string
  const sql = useDb()
  const body = await readBody<{ batchSize?: number, nickname?: string }>(event)

  const batchSize = body?.batchSize !== undefined ? Number(body.batchSize) : undefined
  const nickname = body?.nickname !== undefined ? String(body.nickname).trim() : undefined

  if (batchSize !== undefined && (batchSize < 1 || batchSize > 100)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'batchSize must be between 1 and 100'
    })
  }

  // Build update dynamically
  if (batchSize !== undefined && nickname !== undefined) {
    await sql`UPDATE users SET batch_size = ${batchSize}, nickname = ${nickname} WHERE id = ${userId}`
  } else if (batchSize !== undefined) {
    await sql`UPDATE users SET batch_size = ${batchSize} WHERE id = ${userId}`
  } else if (nickname !== undefined) {
    await sql`UPDATE users SET nickname = ${nickname} WHERE id = ${userId}`
  }

  const [user] = await sql`SELECT batch_size, nickname FROM users WHERE id = ${userId}`

  return {
    batchSize: user?.batch_size ?? 20,
    nickname: user?.nickname ?? ''
  }
})
