export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string
  const sql = useDb()

  const [totalRow] = await sql`SELECT COUNT(*)::int AS total FROM characters`

  const statusCounts = await sql`
    SELECT
      COALESCE(up.status, 0) AS status,
      COUNT(*)::int AS count
    FROM characters c
    LEFT JOIN user_progress up ON up.character_id = c.id AND up.user_id = ${userId}
    GROUP BY COALESCE(up.status, 0)
  `

  const counts: Record<string, number> = {
    pending: 0,
    known: 0,
    familiar: 0,
    unknown: 0
  }

  for (const row of statusCounts) {
    switch (row.status) {
      case 0: counts.pending = row.count; break
      case 1: counts.known = row.count; break
      case 2: counts.familiar = row.count; break
      case 3: counts.unknown = row.count; break
    }
  }

  const [todayRow] = await sql`
    SELECT COUNT(*)::int AS count
    FROM user_progress
    WHERE user_id = ${userId}
      AND updated_at >= CURRENT_DATE
  `

  const [settingsRow] = await sql`
    SELECT nickname FROM users WHERE id = ${userId}
  `

  return {
    total: totalRow?.total || 0,
    pending: counts.pending,
    known: counts.known,
    familiar: counts.familiar,
    unknown: counts.unknown,
    todayCount: todayRow?.count || 0,
    nickname: settingsRow?.nickname || ''
  }
})
