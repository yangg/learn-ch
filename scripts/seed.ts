import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1
})

// Parse a CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++ // skip escaped quote
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        fields.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }
  fields.push(current)
  return fields
}

async function main() {
  console.log('🔧 Creating tables...')

  await sql`
    CREATE TABLE IF NOT EXISTS characters (
      id SERIAL PRIMARY KEY,
      level INTEGER NOT NULL,
      seq INTEGER NOT NULL UNIQUE,
      char TEXT NOT NULL,
      pinyin TEXT NOT NULL,
      words TEXT NOT NULL,
      sentence TEXT NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS user_progress (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      character_id INTEGER NOT NULL REFERENCES characters(id),
      status INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, character_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS user_settings (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      batch_size INTEGER NOT NULL DEFAULT 20
    )
  `

  console.log('✅ Tables created')

  // Read CSV file
  const csvPath = resolve(import.meta.dirname!, '..', '通用规范汉字表_一级字表_词组例句.csv')
  let content = readFileSync(csvPath, 'utf-8')

  // Handle BOM
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1)
  }

  const lines = content.split(/\r?\n/).filter(line => line.trim())

  // Skip header line: 级别,编号,汉字,注音,词组,例句
  const dataLines = lines.slice(1)

  console.log(`📖 Parsing ${dataLines.length} characters from CSV...`)

  const records: { level: number; seq: number; char: string; pinyin: string; words: string; sentence: string }[] = []

  for (const line of dataLines) {
    const fields = parseCSVLine(line)
    if (fields.length < 6) {
      console.warn(`⚠️ Skipping malformed line: ${line.substring(0, 50)}...`)
      continue
    }

    const [levelStr, seqStr, char, pinyin, words, sentence] = fields

    records.push({
      level: parseInt(levelStr, 10),
      seq: parseInt(seqStr, 10),
      char: char.trim(),
      pinyin: pinyin.trim(),
      words: words.trim(),
      sentence: sentence.trim()
    })
  }

  console.log(`📝 Inserting ${records.length} characters...`)

  // Batch insert in chunks of 100
  const BATCH_SIZE = 100
  let inserted = 0

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    await sql`
      INSERT INTO characters ${sql(batch, 'level', 'seq', 'char', 'pinyin', 'words', 'sentence')}
      ON CONFLICT (seq) DO NOTHING
    `
    inserted += batch.length
    process.stdout.write(`\r  Progress: ${inserted}/${records.length}`)
  }

  console.log(`\n✅ Seed complete! Inserted up to ${records.length} characters.`)

  await sql.end()
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
