import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { DEBOREKA_PARTS } from "@/lib/utils"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const part = searchParams.get("part")

    if (part && !DEBOREKA_PARTS.includes(part as any)) {
      return NextResponse.json({ error: "Invalid part" }, { status: 400 })
    }

    let crownsQuery = `
      SELECT 
        c."userId",
        c.part,
        u.id as "user_id",
        u.name as "user_name",
        u.email as "user_email",
        u."familyName" as "user_familyName",
        u.image as "user_image"
      FROM crowns c
      INNER JOIN users u ON c."userId" = u.id
    `

    const params: any[] = []
    if (part) {
      crownsQuery += ` WHERE c.part = $1`
      params.push(part)
    }

    crownsQuery += ` ORDER BY c."createdAt" DESC`

    const crowns = await query<{
      userId: string
      part: string
      user_id: string
      user_name: string | null
      user_email: string
      user_familyName: string | null
      user_image: string | null
    }>(crownsQuery, params)

    // Group by user and part, count crowns
    const crownCounts: Record<string, Record<string, number>> = {}

    for (const crown of crowns) {
      const userId = crown.userId
      if (!crownCounts[userId]) {
        crownCounts[userId] = {}
      }
      if (!crownCounts[userId][crown.part]) {
        crownCounts[userId][crown.part] = 0
      }
      crownCounts[userId][crown.part]++
    }

    // Get unique users
    const userIds = Object.keys(crownCounts)
    if (userIds.length === 0) {
      return NextResponse.json([])
    }
    
    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(', ')
    const users = await query<{
      id: string
      name: string | null
      email: string
      familyName: string | null
      image: string | null
    }>(
      `SELECT id, name, email, "familyName", image FROM users WHERE id IN (${placeholders})`,
      userIds
    )

    const result = users.map((user) => ({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        familyName: user.familyName,
        image: user.image,
      },
      crowns: crownCounts[user.id] || {},
      totalCrowns: Object.values(crownCounts[user.id] || {}).reduce(
        (a, b) => a + b,
        0
      ),
    }))

    result.sort((a, b) => b.totalCrowns - a.totalCrowns)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching crowns:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
