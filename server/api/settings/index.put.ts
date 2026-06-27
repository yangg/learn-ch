export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string
  const sql = useDb()
  const body = await readBody<{ batchSize?: number }>(event)

  const batchSize = Number(body?.batchSize)
  if (!batchSize || batchSize < 1 || batchSize > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'batchSize must be between 1 and 100'
    })
  }

  const [row] = await sql`
    INSERT INTO user_settings (user_id, batch_size)
    VALUES (${userId}, ${batchSize})
    ON CONFLICT (user_id)
    DO UPDATE SET batch_size = ${batchSize}
    RETURNING *
  `

  return {
    batchSize: row.batch_size
  }
})
