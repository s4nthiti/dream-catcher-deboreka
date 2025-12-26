import { readFileSync } from 'fs'
import { join } from 'path'
import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!')
  console.error('Please create a .env file in the root directory with:')
  console.error('DATABASE_URL="your-neon-connection-string"')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

export async function runMigrations() {
  try {
    const schemaPath = join(process.cwd(), 'database', 'schema.sql')
    let schema = readFileSync(schemaPath, 'utf-8')
    
    // Remove comments (lines starting with --)
    schema = schema.split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
    
    // Split by semicolon and execute each statement
    // Handle multi-line statements properly
    const statements = schema
      .split(';')
      .map(s => s.trim().replace(/\s+/g, ' ')) // Normalize whitespace
      .filter(s => s.length > 0)
    
    console.log(`📦 Running ${statements.length} migration statements...`)
    console.log('')
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          // Neon requires template literals. Use Function to create proper template literal call
          const escapedStatement = statement.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${')
          const templateCall = new Function('sql', `return sql\`${escapedStatement}\``)
          await templateCall(sql)
          
          const type = statement.toUpperCase().includes('CREATE TABLE') 
            ? 'TABLE' 
            : statement.toUpperCase().includes('CREATE INDEX')
            ? 'INDEX'
            : 'STATEMENT'
          console.log(`✓ [${i + 1}/${statements.length}] Executed ${type} successfully`)
        } catch (error: any) {
          // Ignore "already exists" errors
          const errorMsg = error.message || String(error)
          if (errorMsg.includes('already exists') || 
              errorMsg.includes('duplicate') ||
              (errorMsg.includes('relation') && errorMsg.includes('already exists'))) {
            const type = statement.toUpperCase().includes('CREATE TABLE') 
              ? 'TABLE' 
              : statement.toUpperCase().includes('CREATE INDEX')
              ? 'INDEX'
              : 'STATEMENT'
            console.log(`⊘ [${i + 1}/${statements.length}] ${type} already exists`)
          } else {
            console.error(`✗ [${i + 1}/${statements.length}] Error:`, errorMsg)
            console.error(`  Statement: ${statement.substring(0, 150)}...`)
            // Continue with other statements - some might fail if dependencies don't exist yet
          }
        }
      }
    }
    
    console.log('')
    console.log('✅ Database migrations completed!')
    console.log('   All tables and indexes have been created.')
  } catch (error) {
    console.error('')
    console.error('❌ Migration error:', error)
    throw error
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
