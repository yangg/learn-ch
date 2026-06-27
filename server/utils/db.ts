import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | null = null

export function useDb() {
  if (!_sql) {
    const config = useRuntimeConfig()
    const dbUrl = config.databaseUrl
      || (globalThis as any).Deno?.env?.get('DATABASE_URL')

    if (!dbUrl) {
      throw new Error('DATABASE_URL is not configured')
    }
    _sql = postgres(dbUrl, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10
    })
  }
  return _sql
}
