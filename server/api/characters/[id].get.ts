export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string
  const sql = useDb()
  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid character ID'
    })
  }

  const [row] = await sql`
    SELECT c.*, COALESCE(up.status, 0) AS status, up.updated_at
    FROM characters c
    LEFT JOIN user_progress up ON up.character_id = c.id AND up.user_id = ${userId}
    WHERE c.id = ${id}
  `

  if (!row) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Character not found'
    })
  }

  return row
})
