export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string
  const sql = useDb()
  const query = getQuery(event)

  let count = Number(query.count)

  if (!count || count <= 0) {
    const [settings] = await sql`
      SELECT batch_size FROM user_settings WHERE user_id = ${userId}
    `
    count = settings?.batch_size ?? 20
  }

  const excludeStr = query.exclude as string | undefined
  const excludeIds = excludeStr ? excludeStr.split(',').map(Number).filter(n => !isNaN(n)) : []

  let rows
  if (excludeIds.length > 0) {
    rows = await sql`
      SELECT c.*, up.status
      FROM characters c
      INNER JOIN user_progress up ON up.character_id = c.id AND up.user_id = ${userId}
      WHERE up.status = 3 AND c.id NOT IN (${excludeIds})
      ORDER BY RANDOM()
      LIMIT ${count}
    `
  } else {
    rows = await sql`
      SELECT c.*, up.status
      FROM characters c
      INNER JOIN user_progress up ON up.character_id = c.id AND up.user_id = ${userId}
      WHERE up.status = 3
      ORDER BY RANDOM()
      LIMIT ${count}
    `
  }

  return { characters: rows }
})
