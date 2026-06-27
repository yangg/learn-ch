export default defineEventHandler(async (event) => {
  const userId = event.context.userId as number
  const sql = useDb()
  const body = await readBody<{ text?: string }>(event)

  if (!body?.text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'text is required'
    })
  }

  // Split text into individual characters, filtering out whitespace and empty strings
  const chars = [...new Set(
    body.text
      .split(/[\s,，、;；]+/)
      .join('')
      .split('')
      .filter(c => c.trim())
  )]

  if (chars.length === 0) {
    return { imported: 0, total: 0 }
  }

  // Find matching characters in the database
  const matchedChars = await sql`
    SELECT id, char FROM characters WHERE char IN ${sql(chars)}
  `

  if (matchedChars.length === 0) {
    return { imported: 0, total: chars.length }
  }

  // Upsert progress for each matched character as status=1 (认识)
  const values = matchedChars.map(c => ({
    user_id: userId,
    character_id: c.id,
    status: 1,
    updated_at: new Date()
  }))

  await sql`
    INSERT INTO user_progress ${sql(values)}
    ON CONFLICT (user_id, character_id)
    DO UPDATE SET status = 1, updated_at = NOW()
  `

  return {
    imported: matchedChars.length,
    total: chars.length
  }
})
