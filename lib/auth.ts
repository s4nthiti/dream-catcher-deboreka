import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { NeonAdapter } from "@/lib/auth-adapter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: NeonAdapter(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        const { queryOne } = await import("@/lib/db")
        const dbUser = await queryOne<{ id: string; familyName: string | null; isAdmin: boolean }>(
          `SELECT id, "familyName", "isAdmin" FROM users WHERE id = $1`,
          [user.id]
        )
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.familyName = dbUser.familyName
          session.user.isAdmin = dbUser.isAdmin ?? false
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
})

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      familyName?: string | null
      isAdmin: boolean
    }
  }
}

