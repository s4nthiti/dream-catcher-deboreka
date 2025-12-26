# Migration from Prisma to Neon

This project has been migrated from Prisma ORM to direct Neon serverless database queries.

## Changes Made

### Removed
- Prisma ORM (`@prisma/client`, `prisma`)
- Prisma adapter for NextAuth (`@auth/prisma-adapter`)
- Prisma schema files (`prisma/schema.prisma`, `prisma.config.ts`)
- Prisma migration system

### Added
- Direct Neon serverless database connection (`@neondatabase/serverless`)
- SQL schema file (`database/schema.sql`)
- Custom NextAuth adapter (`lib/auth-adapter.ts`)
- SQL migration script (`database/migrate.ts`)
- Database query helpers (`lib/db.ts`)

## Database Schema

The database schema is now defined in `database/schema.sql`. To apply it:

```bash
npm run db:migrate
```

## Query Pattern

All database queries now use raw SQL with the helper functions:

```typescript
import { query, queryOne } from '@/lib/db'

// Multiple rows
const users = await query<User>(
  'SELECT * FROM users WHERE "isAdmin" = $1',
  [true]
)

// Single row
const user = await queryOne<User>(
  'SELECT * FROM users WHERE id = $1',
  [userId]
)
```

## NextAuth Adapter

A custom Neon adapter has been created in `lib/auth-adapter.ts` that implements the NextAuth adapter interface using direct SQL queries.

## Notes

- All queries use positional parameters ($1, $2, etc.) which are converted to Neon's template literal format
- The migration script is idempotent and safe to run multiple times
- Indexes and constraints are defined in the SQL schema

