import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query, queryOne } from "@/lib/db"
import { getWeekStart } from "@/lib/utils"
import { globalEvents, EVENTS } from "@/lib/events"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { part, count } = body

    if (!part || !count || count < 1) {
      return NextResponse.json(
        { error: "Invalid input: part and count are required" },
        { status: 400 }
      )
    }

    const weekStart = getWeekStart()
    // Price is no longer used, set to 0
    const price = 0

    const result = await queryOne<{
      id: string
      userId: string
      part: string
      count: number
      price: number
      weekStartDate: Date
      createdAt: Date
      updatedAt: Date
    }>(
      `INSERT INTO enhancements ("userId", part, count, price, "weekStartDate", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, "userId", part, count, price, "weekStartDate", "createdAt", "updatedAt"`,
      [session.user.id, part, count, price, weekStart]
    )

    if (!result) {
      throw new Error("Failed to create enhancement")
    }

    // Emit events for real-time updates (crowns will be awarded on Sunday)
    globalEvents.emit(EVENTS.ENHANCEMENT_ADDED, { part, count, weekStart })
    globalEvents.emit(EVENTS.SCOREBOARD_UPDATED, { weekStart })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating enhancement:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const weekStartParam = searchParams.get("weekStart")
    const weekStart = weekStartParam
      ? new Date(weekStartParam)
      : getWeekStart()

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
      userImage: string | null
    }>(
      `SELECT 
        e.id, e."userId", e.part, e.count, e.price, e."weekStartDate", e."createdAt", e."updatedAt",
        u.name as "userName", u.email as "userEmail", u."familyName" as "userFamilyName", u.image as "userImage"
       FROM enhancements e
       INNER JOIN users u ON e."userId" = u.id
       WHERE e."weekStartDate" = $1 AND e."isDeleted" = false
       ORDER BY e."createdAt" DESC`,
      [weekStart]
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
        image: e.userImage,
      },
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching enhancements:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

