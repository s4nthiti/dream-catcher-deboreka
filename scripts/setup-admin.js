/**
 * Script to set up an admin user
 * Usage: node scripts/setup-admin.js <email>
 */

const { neon } = require('@neondatabase/serverless')
require('dotenv').config()

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Please provide an email address')
    console.log('Usage: node scripts/setup-admin.js <email>')
    process.exit(1)
  }

  try {
    const result = await sql`
      UPDATE users 
      SET "isAdmin" = true, "updatedAt" = NOW()
      WHERE email = ${email}
      RETURNING id, email, name, "familyName", "isAdmin"
    `

    if (result.length === 0) {
      console.error(`❌ User with email ${email} not found`)
      process.exit(1)
    }

    console.log(`✅ User ${result[0].email} is now an admin`)
    console.log('User details:', result[0])
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
