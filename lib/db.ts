import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const sql = neon(process.env.DATABASE_URL)

// Export sql for direct template literal usage
export { sql }

// Helper function to execute queries with parameters
// Neon uses tagged template literals with interpolation: sql`SELECT * FROM users WHERE id = ${userId}`
// We need to convert $1, $2 style params to this format
export async function query<T = any>(queryText: string, params?: any[]): Promise<T[]> {
  try {
    if (!params || params.length === 0) {
      // For queries without parameters, use as tagged template
      const parts = [queryText]
      const templateArray: any = Object.assign(parts, { raw: parts })
      const result = await sql(templateArray)
      return Array.isArray(result) ? (result as T[]) : ([result] as T[])
    }

    // Convert $1, $2, etc. to tagged template format
    // Split the query by $1, $2, ... and interleave with params
    const parts: string[] = []
    let remaining = queryText
    
    for (let i = 1; i <= params.length; i++) {
      const placeholder = `$${i}`
      const index = remaining.indexOf(placeholder)
      
      if (index !== -1) {
        parts.push(remaining.substring(0, index))
        remaining = remaining.substring(index + placeholder.length)
      }
    }
    parts.push(remaining) // Add the final part
    
    // Create template array with raw property
    const templateArray: any = Object.assign(parts, { raw: parts })
    
    // Call sql as tagged template with interpolated values
    const result = await sql(templateArray, ...params)
    return Array.isArray(result) ? (result as T[]) : ([result] as T[])
  } catch (error) {
    console.error('Database query error:', error)
    console.error('Query:', queryText)
    console.error('Params:', params)
    throw error
  }
}

// Helper function for single row queries
export async function queryOne<T = any>(queryText: string, params?: any[]): Promise<T | null> {
  const result = await query<T>(queryText, params)
  return result.length > 0 ? result[0] : null
}
