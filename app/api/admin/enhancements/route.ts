import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query, queryOne } from "@/lib/db"
import { globalEvents, EVENTS } from "@/lib/events"

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Enhancement ID required" },
        { status: 400 }
      )
    }

    // Soft delete
    const result = await queryOne<{
      id: string
      userId: string
      part: string
      count: number
      price: number
      weekStartDate: Date
      createdAt: Date
      updatedAt: Date
      isDeleted: boolean
    }>(
      `UPDATE enhancements SET "isDeleted" = true, "updatedAt" = NOW()
       WHERE id = $1
       RETURNING id, "userId", part, count, price, "weekStartDate", "createdAt", "updatedAt", "isDeleted"`,
      [id]
    )

    if (!result) {
      return NextResponse.json(
        { error: "Enhancement not found" },
        { status: 404 }
      )
    }

    // Emit events for real-time updates (crowns will be recalculated on Sunday)
    globalEvents.emit(EVENTS.ENHANCEMENT_DELETED, { id })
    globalEvents.emit(EVENTS.SCOREBOARD_UPDATED, { weekStart: result.weekStartDate })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting enhancement:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const enhancements = await query<{
      id: string
      userId: string
      part: string
      count: number
      price: number
      weekStartDate: Date
      createdAt: Date
      updatedAt: Date
      userName: string | null
      userEmail: string
      userFamilyName: string | null
    }>(
      `SELECT 
        e.id, e."userId", e.part, e.count, e.price, e."weekStartDate", e."createdAt", e."updatedAt",
        u.name as "userName", u.email as "userEmail", u."familyName" as "userFamilyName"
       FROM enhancements e
       INNER JOIN users u ON e."userId" = u.id
       WHERE e."isDeleted" = false
       ORDER BY e."createdAt" DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    const totalResult = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM enhancements WHERE "isDeleted" = false`
    )

    const formatted = enhancements.map((e) => ({
      id: e.id,
      userId: e.userId,
      part: e.part,
      count: e.count,
      price: e.price,
      weekStartDate: e.weekStartDate,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      user: {
        id: e.userId,
        name: e.userName,
        email: e.userEmail,
        familyName: e.userFamilyName,
      },
    }))

    return NextResponse.json({
      enhancements: formatted,
      total: totalResult ? Number(totalResult.count) : 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching enhancements:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
