import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { DEBOREKA_PARTS } from "@/lib/utils"
import { globalEvents, EVENTS } from "@/lib/events"

// Get the previous week's start date (last Sunday)
function getPreviousWeekStart(): Date {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayOfWeek = today.getDay()
  
  // Calculate days to subtract to get to previous Sunday
  const daysToSubtract = dayOfWeek === 0 ? 7 : dayOfWeek
  const previousSunday = new Date(today)
  previousSunday.setDate(today.getDate() - daysToSubtract)
  
  return previousSunday
}

// This endpoint should be called on Sunday to award crowns for the previous week
export async function POST(req: NextRequest) {
  try {
    // Verify this is a cron job or authorized request
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Award crowns for the previous week (the week that just ended)
    const previousWeekStart = getPreviousWeekStart()
    const results = []

    console.log(`Awarding crowns for week starting: ${previousWeekStart.toISOString()}`)

    // Award crowns for each Deboreka part
    for (const part of DEBOREKA_PARTS) {
      const result = await awardCrownForPart(part, previousWeekStart)
      results.push(result)
    }

    // Emit event to update crown scoreboard
    globalEvents.emit(EVENTS.CROWNS_UPDATED, {})

    return NextResponse.json({
      message: "Crowns awarded successfully for previous week",
      weekStart: previousWeekStart.toISOString(),
      results,
    })
  } catch (error) {
    console.error("Error awarding crowns:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Allow GET for manual trigger by admin
export async function GET(req: NextRequest) {
  try {
    // Get the week start date from query params
    const { searchParams } = new URL(req.url)
    const weekStartParam = searchParams.get("weekStart")

    if (!weekStartParam) {
      return NextResponse.json(
        { error: "weekStart query parameter is required" },
        { status: 400 }
      )
    }

    const weekStartDate = new Date(weekStartParam)
    const results = []

    // Award crowns for each Deboreka part
    for (const part of DEBOREKA_PARTS) {
      const result = await awardCrownForPart(part, weekStartDate)
      results.push(result)
    }

    // Emit event to update crown scoreboard
    globalEvents.emit(EVENTS.CROWNS_UPDATED, {})

    return NextResponse.json({
      message: "Crowns awarded successfully",
      results,
    })
  } catch (error) {
    console.error("Error awarding crowns:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function awardCrownForPart(part: string, weekStart: Date) {
  // Get the top user for this part and week
  const userTotals = await query<{
    userId: string
    totalCount: number
  }>(
    `SELECT "userId", SUM(count) as "totalCount"
     FROM enhancements
     WHERE part = $1 AND "weekStartDate" = $2 AND "isDeleted" = false
     GROUP BY "userId"
     ORDER BY "totalCount" DESC
     LIMIT 1`,
    [part, weekStart]
  )

  if (userTotals.length === 0 || userTotals[0].totalCount === 0) {
    return {
      part,
      winner: null,
      message: "No enhancements for this part",
    }
  }

  const winnerId = userTotals[0].userId
  const totalCount = userTotals[0].totalCount

  // Check if crown already exists
  const existingCrown = await queryOne<{ id: string }>(
    `SELECT id FROM crowns 
     WHERE "userId" = $1 AND part = $2 AND "weekStartDate" = $3`,
    [winnerId, part, weekStart]
  )

  if (existingCrown) {
    return {
      part,
      winner: winnerId,
      totalCount,
      message: "Crown already awarded",
      crownId: existingCrown.id,
    }
  }

  // Award the crown
  const crown = await queryOne<{ id: string }>(
    `INSERT INTO crowns ("userId", part, "weekStartDate", "createdAt")
     VALUES ($1, $2, $3, NOW())
     RETURNING id`,
    [winnerId, part, weekStart]
  )

  return {
    part,
    winner: winnerId,
    totalCount,
    message: "Crown awarded",
    crownId: crown?.id,
  }
}

