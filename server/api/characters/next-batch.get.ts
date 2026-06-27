export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string
  const sql = useDb()
  const query = getQuery(event)

  let count = Number(query.count)

  if (!count || count <= 0) {
    // Get user's batch_size setting, default to 20
    const [settings] = await sql`
      SELECT batch_size FROM user_settings WHERE user_id = ${userId}
    `
    count = settings?.batch_size ?? 20
  }

  const excludeStr = query.exclude as string | undefined
  const excludeIds = excludeStr ? excludeStr.split(',').map(Number).filter(n => !isNaN(n)) : []

  const rows = await sql`
    SELECT c.*, COALESCE(up.status, 0) AS status
    FROM characters c
    LEFT JOIN user_progress up ON up.character_id = c.id AND up.user_id = ${userId}
    WHERE (up.id IS NULL OR up.status = 0)
      ${excludeIds.length > 0 ? sql`AND c.id <> ALL(${excludeIds})` : sql``}
    ORDER BY c.seq ASC
    LIMIT ${count}
  `

  return { characters: rows }
})
