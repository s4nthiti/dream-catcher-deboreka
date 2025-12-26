import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { getWeekStart, DEBOREKA_PARTS } from "@/lib/utils"

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

    const scoreboards: Record<string, any[]> = {}

    for (const part of DEBOREKA_PARTS) {
      const scores = await query<{
        userId: string
        userName: string | null
        userEmail: string
        userFamilyName: string | null
        userImage: string | null
        totalCount: number
        totalPrice: number
      }>(
        `SELECT 
          u.id as "userId",
          u.name as "userName",
          u.email as "userEmail",
          u."familyName" as "userFamilyName",
          u.image as "userImage",
          SUM(e.count) as "totalCount",
          SUM(e.count * e.price) as "totalPrice"
         FROM enhancements e
         INNER JOIN users u ON e."userId" = u.id
         WHERE e.part = $1 AND e."weekStartDate" = $2 AND e."isDeleted" = false
         GROUP BY u.id, u.name, u.email, u."familyName", u.image
         ORDER BY "totalCount" DESC`,
        [part, weekStart]
      )

      scoreboards[part] = scores.map((s) => ({
        user: {
          id: s.userId,
          name: s.userName,
          email: s.userEmail,
          familyName: s.userFamilyName,
          image: s.userImage,
        },
        totalCount: Number(s.totalCount),
        totalPrice: Number(s.totalPrice),
      }))
    }

    return NextResponse.json({ weekStart, scoreboards })
  } catch (error) {
    console.error("Error fetching scoreboard:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
