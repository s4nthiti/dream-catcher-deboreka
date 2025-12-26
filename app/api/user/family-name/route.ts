import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { queryOne } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { familyName } = body

    if (!familyName || typeof familyName !== "string" || familyName.trim().length === 0) {
      return NextResponse.json(
        { error: "Family name is required" },
        { status: 400 }
      )
    }

    const user = await queryOne<{
      id: string
      email: string
      name: string | null
      image: string | null
      familyName: string | null
      isAdmin: boolean
      createdAt: Date
      updatedAt: Date
    }>(
      `UPDATE users SET "familyName" = $1, "updatedAt" = NOW()
       WHERE id = $2
       RETURNING id, email, name, image, "familyName", "isAdmin", "createdAt", "updatedAt"`,
      [familyName.trim(), session.user.id]
    )

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating family name:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
