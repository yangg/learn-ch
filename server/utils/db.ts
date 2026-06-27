import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | null = null

export function useDb() {
  if (!_sql) {
    const config = useRuntimeConfig()
    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL is not configured')
    }
    _sql = postgres(config.databaseUrl, {
      ssl: 'require',
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10
    })
  }
  return _sql
}
