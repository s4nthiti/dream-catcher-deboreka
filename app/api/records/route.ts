import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query, queryOne } from "@/lib/db"
import { globalEvents, EVENTS } from "@/lib/events"

// POST - Create a new enhancement record
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { part, fromLevel, level, success = true } = body

    // Validate part
    const validParts = ['NECKLACE', 'EARRING', 'RING', 'BELT']
    if (!part || !validParts.includes(part)) {
      return NextResponse.json(
        { error: "Invalid part. Must be NECKLACE, EARRING, RING, or BELT" },
        { status: 400 }
      )
    }

    // Validate fromLevel (optional)
    const validFromLevels = ['0', 'I', 'II', 'III', 'IV']
    if (fromLevel && !validFromLevels.includes(fromLevel)) {
      return NextResponse.json(
        { error: "Invalid fromLevel. Must be 0, I, II, III, or IV" },
        { status: 400 }
      )
    }

    // Validate level
    const validLevels = ['I', 'II', 'III', 'IV', 'V']
    if (!level || !validLevels.includes(level)) {
      return NextResponse.json(
        { error: "Invalid level. Must be I, II, III, IV, or V" },
        { status: 400 }
      )
    }

    // Validate success (must be boolean)
    if (typeof success !== 'boolean') {
      return NextResponse.json(
        { error: "Invalid success value. Must be true or false" },
        { status: 400 }
      )
    }

    const result = await queryOne<{
      id: string
      userId: string
      part: string
      fromLevel: string | null
      level: string
      success: boolean
      createdAt: Date
    }>(
      `INSERT INTO enhancement_records ("userId", part, "fromLevel", level, success, "createdAt")
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, "userId", part, "fromLevel", level, success, "createdAt"`,
      [session.user.id, part, fromLevel || null, level, success]
    )

    if (!result) {
      throw new Error("Failed to create enhancement record")
    }

    // Emit event for real-time updates
    globalEvents.emit(EVENTS.ENHANCEMENT_ADDED, { part, level })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating enhancement record:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET - Fetch last 10 enhancement records from all users
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const records = await query<{
      id: string
      userId: string
      part: string
      fromLevel: string | null
      level: string
      success: boolean
      createdAt: Date
      userName: string | null
      userEmail: string
      userFamilyName: string | null
      userImage: string | null
    }>(
      `SELECT 
        r.id, r."userId", r.part, r."fromLevel", r.level, r.success, r."createdAt",
        u.name as "userName", u.email as "userEmail", u."familyName" as "userFamilyName", u.image as "userImage"
       FROM enhancement_records r
       INNER JOIN users u ON r."userId" = u.id
       ORDER BY r."createdAt" DESC
       LIMIT 10`
    )

    const formatted = records.map((r) => ({
      id: r.id,
      userId: r.userId,
      part: r.part,
      fromLevel: r.fromLevel,
      level: r.level,
      success: r.success,
      createdAt: r.createdAt,
      user: {
        id: r.userId,
        name: r.userName,
        email: r.userEmail,
        familyName: r.userFamilyName,
        image: r.userImage,
      },
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching enhancement records:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

