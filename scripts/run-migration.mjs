import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:')
    if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
    try {
        const sql = readFileSync(join(__dirname, '005_add_messages_delete_policy.sql'), 'utf8')

        // Split the file by statement (each statement should end with ;)
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'))

        console.log(`Running ${statements.length} SQL statements...`)

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 60)}...`)
            const { error } = await supabase.rpc('exec_sql', { sql_query: statement })

            if (error) {
                console.error('Error:', error)
                throw error
            }
        }

        console.log('✅ Migration completed successfully!')
    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
}

runMigration()
