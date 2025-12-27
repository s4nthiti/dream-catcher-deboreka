-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  "familyName" TEXT,
  "isAdmin" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Accounts table (for NextAuth)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, "providerAccountId")
);

-- Sessions table (for NextAuth)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

-- Verification tokens table (for NextAuth)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Deboreka parts enum (using TEXT with CHECK constraint)
-- NECKLACE, EARRING, RING, BELT

-- Enhancements table
CREATE TABLE IF NOT EXISTS enhancements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  part TEXT NOT NULL CHECK (part IN ('NECKLACE', 'EARRING', 'RING', 'BELT')),
  count INTEGER NOT NULL,
  price INTEGER NOT NULL,
  "weekStartDate" DATE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "isDeleted" BOOLEAN DEFAULT false
);

-- Crowns table
CREATE TABLE IF NOT EXISTS crowns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  part TEXT NOT NULL CHECK (part IN ('NECKLACE', 'EARRING', 'RING', 'BELT')),
  "weekStartDate" DATE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", part, "weekStartDate")
);

-- Enhancement Records table (for tracking enhancement levels 0-V)
CREATE TABLE IF NOT EXISTS enhancement_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  part TEXT NOT NULL CHECK (part IN ('NECKLACE', 'EARRING', 'RING', 'BELT')),
  "fromLevel" TEXT CHECK ("fromLevel" IN ('0', 'I', 'II', 'III', 'IV')),
  level TEXT NOT NULL CHECK (level IN ('0', 'I', 'II', 'III', 'IV', 'V')),
  success BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_enhancements_user_week_part ON enhancements("userId", "weekStartDate", part);
CREATE INDEX IF NOT EXISTS idx_enhancements_week_part ON enhancements("weekStartDate", part);
CREATE INDEX IF NOT EXISTS idx_crowns_part_week ON crowns(part, "weekStartDate");
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions("sessionToken");
CREATE INDEX IF NOT EXISTS idx_enhancement_records_created ON enhancement_records("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_enhancement_records_user ON enhancement_records("userId");
CREATE INDEX IF NOT EXISTS idx_enhancement_records_part ON enhancement_records(part);

