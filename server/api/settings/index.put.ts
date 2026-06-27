export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string
  const sql = useDb()
  const body = await readBody<{ batchSize?: number, nickname?: string }>(event)

  // Get current settings for defaults
  const [current] = await sql`
    SELECT batch_size, nickname FROM user_settings WHERE user_id = ${userId}
  `

  const batchSize = body?.batchSize !== undefined ? Number(body.batchSize) : (current?.batch_size ?? 20)
  const nickname = body?.nickname !== undefined ? String(body.nickname).trim() : (current?.nickname ?? '')

  if (batchSize < 1 || batchSize > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'batchSize must be between 1 and 100'
    })
  }

  const [row] = await sql`
    INSERT INTO user_settings (user_id, batch_size, nickname)
    VALUES (${userId}, ${batchSize}, ${nickname})
    ON CONFLICT (user_id)
    DO UPDATE SET batch_size = ${batchSize}, nickname = ${nickname}
    RETURNING *
  `

  return {
    batchSize: row?.batch_size || batchSize,
    nickname: row?.nickname || nickname
  }
})
