export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string
  const sql = useDb()
  const query = getQuery(event)

  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.max(1, Math.min(500, Number(query.pageSize) || 100))
  const offset = (page - 1) * pageSize
  const statusFilter = query.status !== undefined ? Number(query.status) : null

  let rows
  let totalRows

  if (statusFilter !== null) {
    if (statusFilter === 0) {
      // Status 0: characters without progress OR with status = 0
      rows = await sql`
        SELECT c.*, COALESCE(up.status, 0) AS status, up.updated_at
        FROM characters c
        LEFT JOIN user_progress up ON up.character_id = c.id AND up.user_id = ${userId}
        WHERE up.id IS NULL OR up.status = 0
        ORDER BY c.seq ASC
        LIMIT ${pageSize} OFFSET ${offset}
      `
      totalRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM characters c
        LEFT JOIN user_progress up ON up.character_id = c.id AND up.user_id = ${userId}
        WHERE up.id IS NULL OR up.status = 0
      `
    } else {
      rows = await sql`
        SELECT c.*, up.status, up.updated_at
        FROM characters c
        INNER JOIN user_progress up ON up.character_id = c.id AND up.user_id = ${userId}
        WHERE up.status = ${statusFilter}
        ORDER BY c.seq ASC
        LIMIT ${pageSize} OFFSET ${offset}
      `
      totalRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM characters c
        INNER JOIN user_progress up ON up.character_id = c.id AND up.user_id = ${userId}
        WHERE up.status = ${statusFilter}
      `
    }
  } else {
    rows = await sql`
      SELECT c.*, COALESCE(up.status, 0) AS status, up.updated_at
      FROM characters c
      LEFT JOIN user_progress up ON up.character_id = c.id AND up.user_id = ${userId}
      ORDER BY c.seq ASC
      LIMIT ${pageSize} OFFSET ${offset}
    `
    totalRows = await sql`
      SELECT COUNT(*)::int AS total FROM characters
    `
  }

  return {
    characters: rows,
    total: totalRows[0]?.total || 0
  }
})
