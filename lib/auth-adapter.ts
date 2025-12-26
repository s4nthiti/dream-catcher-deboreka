import { Adapter } from "next-auth/adapters"
import { sql, query, queryOne } from "@/lib/db"

export function NeonAdapter(): Adapter {
  return {
    async createUser(user) {
      const result = await queryOne<{ id: string }>(
        `INSERT INTO users (email, name, image, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, email, name, image, "familyName", "isAdmin", "createdAt", "updatedAt"`,
        [user.email, user.name || null, user.image || null]
      )
      return {
        id: result!.id,
        email: result!.email,
        name: result!.name,
        emailVerified: null,
        image: result!.image,
      }
    },

    async getUser(id) {
      const user = await queryOne<{
        id: string
        email: string
        name: string | null
        image: string | null
        emailVerified: Date | null
      }>(
        `SELECT id, email, name, image, "createdAt" as "emailVerified" FROM users WHERE id = $1`,
        [id]
      )
      if (!user) return null
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        image: user.image,
      }
    },

    async getUserByEmail(email) {
      const user = await queryOne<{
        id: string
        email: string
        name: string | null
        image: string | null
        emailVerified: Date | null
      }>(
        `SELECT id, email, name, image, "createdAt" as "emailVerified" FROM users WHERE email = $1`,
        [email]
      )
      if (!user) return null
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        image: user.image,
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const result = await queryOne<{
        userId: string
        id: string
        email: string
        name: string | null
        image: string | null
        emailVerified: Date | null
      }>(
        `SELECT u.id, u.email, u.name, u.image, u."createdAt" as "emailVerified"
         FROM users u
         INNER JOIN accounts a ON u.id = a."userId"
         WHERE a.provider = $1 AND a."providerAccountId" = $2`,
        [provider, providerAccountId]
      )
      if (!result) return null
      return {
        id: result.id,
        email: result.email,
        name: result.name,
        emailVerified: result.emailVerified,
        image: result.image,
      }
    },

    async updateUser(user) {
      const updates: string[] = []
      const values: any[] = []
      let paramCount = 1

      if (user.name !== undefined) {
        updates.push(`name = $${paramCount++}`)
        values.push(user.name)
      }
      if (user.image !== undefined) {
        updates.push(`image = $${paramCount++}`)
        values.push(user.image)
      }
      if (user.email !== undefined) {
        updates.push(`email = $${paramCount++}`)
        values.push(user.email)
      }

      if (updates.length === 0) {
        const existing = await this.getUser(user.id)
        if (!existing) throw new Error("User not found")
        return existing
      }

      updates.push(`"updatedAt" = NOW()`)
      values.push(user.id)

      const result = await queryOne<{
        id: string
        email: string
        name: string | null
        image: string | null
        emailVerified: Date | null
      }>(
        `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING id, email, name, image, "createdAt" as "emailVerified"`,
        values
      )

      if (!result) throw new Error("User not found")
      return {
        id: result.id,
        email: result.email,
        name: result.name,
        emailVerified: result.emailVerified,
        image: result.image,
      }
    },

    async linkAccount(account) {
      await query(
        `INSERT INTO accounts (
          "userId", type, provider, "providerAccountId",
          refresh_token, access_token, expires_at, token_type, scope, id_token, session_state
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token || null,
          account.access_token || null,
          account.expires_at || null,
          account.token_type || null,
          account.scope || null,
          account.id_token || null,
          account.session_state || null,
        ]
      )
      return account
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await query(
        `DELETE FROM accounts WHERE provider = $1 AND "providerAccountId" = $2`,
        [provider, providerAccountId]
      )
    },

    async createSession({ sessionToken, userId, expires }) {
      const result = await queryOne<{
        id: string
        sessionToken: string
        userId: string
        expires: Date
      }>(
        `INSERT INTO sessions ("sessionToken", "userId", expires)
         VALUES ($1, $2, $3)
         RETURNING id, "sessionToken", "userId", expires`,
        [sessionToken, userId, expires]
      )
      if (!result) throw new Error("Failed to create session")
      return {
        sessionToken: result.sessionToken,
        userId: result.userId,
        expires: result.expires,
      }
    },

    async getSessionAndUser(sessionToken) {
      const result = await queryOne<{
        sessionId: string
        sessionToken: string
        userId: string
        expires: Date
        userId2: string
        email: string
        name: string | null
        image: string | null
        emailVerified: Date | null
      }>(
        `SELECT s.id as "sessionId", s."sessionToken", s."userId", s.expires,
                u.id as "userId2", u.email, u.name, u.image, u."createdAt" as "emailVerified"
         FROM sessions s
         INNER JOIN users u ON s."userId" = u.id
         WHERE s."sessionToken" = $1 AND s.expires > NOW()`,
        [sessionToken]
      )

      if (!result) return null

      return {
        session: {
          sessionToken: result.sessionToken,
          userId: result.userId,
          expires: result.expires,
        },
        user: {
          id: result.userId2,
          email: result.email,
          name: result.name,
          emailVerified: result.emailVerified,
          image: result.image,
        },
      }
    },

    async updateSession({ sessionToken, ...data }) {
      const updates: string[] = []
      const values: any[] = []
      let paramCount = 1

      if (data.expires) {
        updates.push(`expires = $${paramCount++}`)
        values.push(data.expires)
      }
      if (data.userId) {
        updates.push(`"userId" = $${paramCount++}`)
        values.push(data.userId)
      }

      if (updates.length === 0) {
        const existing = await queryOne<{
          sessionToken: string
          userId: string
          expires: Date
        }>(
          `SELECT "sessionToken", "userId", expires FROM sessions WHERE "sessionToken" = $1`,
          [sessionToken]
        )
        if (!existing) return null
        return existing
      }

      values.push(sessionToken)

      const result = await queryOne<{
        sessionToken: string
        userId: string
        expires: Date
      }>(
        `UPDATE sessions SET ${updates.join(", ")} WHERE "sessionToken" = $${paramCount} RETURNING "sessionToken", "userId", expires`,
        values
      )

      return result || null
    },

    async deleteSession(sessionToken) {
      await query(`DELETE FROM sessions WHERE "sessionToken" = $1`, [sessionToken])
    },

    async createVerificationToken({ identifier, token, expires }) {
      await query(
        `INSERT INTO verification_tokens (identifier, token, expires) VALUES ($1, $2, $3)`,
        [identifier, token, expires]
      )
      return { identifier, token, expires }
    },

    async useVerificationToken({ identifier, token }) {
      const result = await queryOne<{
        identifier: string
        token: string
        expires: Date
      }>(
        `DELETE FROM verification_tokens WHERE identifier = $1 AND token = $2 RETURNING identifier, token, expires`,
        [identifier, token]
      )
      return result || null
    },
  }
}

