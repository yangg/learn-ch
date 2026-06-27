import postgres from 'postgres'

try {
  process.loadEnvFile()
} catch {
  // Ignore error if .env file doesn't exist
}

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, { max: 1 })

async function main() {
  console.log('🔧 Migrating user_progress.user_id to INTEGER...')

  // Step 1: Set all user_id to '1'
  const updated = await sql`
    UPDATE user_progress SET user_id = '1'
  `
  console.log(`✅ Updated ${updated.count} rows to user_id = '1'`)

  // Step 2: Drop the unique constraint (depends on TEXT type)
  await sql`
    ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_character_id_key
  `
  console.log('✅ Dropped old unique constraint')

  // Step 3: Alter column type from TEXT to INTEGER
  await sql`
    ALTER TABLE user_progress
    ALTER COLUMN user_id TYPE INTEGER USING user_id::INTEGER
  `
  console.log('✅ Changed user_id column type to INTEGER')

  // Step 4: Re-add unique constraint
  await sql`
    ALTER TABLE user_progress
    ADD CONSTRAINT user_progress_user_id_character_id_key UNIQUE (user_id, character_id)
  `
  console.log('✅ Re-added unique constraint')

  // Step 5: Add foreign key to users table
  await sql`
    ALTER TABLE user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
  `
  console.log('✅ Added foreign key constraint to users(id)')

  // Step 6: Drop legacy user_settings table if exists
  await sql`DROP TABLE IF EXISTS user_settings`
  console.log('✅ Dropped legacy user_settings table')

  console.log('\n🎉 Migration complete!')
  await sql.end()
}

main().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
