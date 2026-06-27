import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | null = null

export function useDb() {
  if (!_sql) {
    const config = useRuntimeConfig()
    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL is not configured')
    }
    _sql = postgres(config.databaseUrl, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10
    })
    // Ensure nickname column exists
    _sql`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS nickname TEXT;`.catch(err => {
      console.error('Migration failed to add nickname column:', err)
    })
  }
  return _sql
}
