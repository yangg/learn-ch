export default defineEventHandler(async (event) => {
  const userId = event.context.userId as number
  const sql = useDb()
  const body = await readBody<{ character_id?: number, status?: number }>(event)

  if (!body?.character_id || body.status === undefined || body.status === null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'character_id and status are required'
    })
  }

  if (![0, 1, 2, 3].includes(body.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'status must be 0, 1, 2, or 3'
    })
  }

  const [row] = await sql`
    INSERT INTO user_progress (user_id, character_id, status, updated_at)
    VALUES (${userId}, ${body.character_id}, ${body.status}, NOW())
    ON CONFLICT (user_id, character_id)
    DO UPDATE SET status = ${body.status}, updated_at = NOW()
    RETURNING *
  `

  return row
})
