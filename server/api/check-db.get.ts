export default defineEventHandler(async () => {
  const sql = useDb()
  const times: number[] = []

  for (let i = 0; i < 5; i++) {
    const start = performance.now()
    await sql`SELECT 1`
    times.push(performance.now() - start)
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length

  return {
    ok: true,
    queries: 5,
    times: times.map(t => `${t.toFixed(2)}ms`),
    avg: `${avg.toFixed(2)}ms`,
  }
})
