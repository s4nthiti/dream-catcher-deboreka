"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { DEBOREKA_PARTS } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"

const PART_TRANSLATIONS: Record<string, { en: string; th: string }> = {
  NECKLACE: { en: "Necklace", th: "สร้อยคอ" },
  EARRING: { en: "Earring", th: "ต่างหู" },
  RING: { en: "Ring", th: "แหวน" },
  BELT: { en: "Belt", th: "เข็มขัด" },
}

const PART_IMAGES: Record<string, string> = {
  NECKLACE: "/debonecklace.webp",
  EARRING: "/deboearring.webp",
  RING: "/deboring.webp",
  BELT: "/debobelt.webp",
}

interface ScoreboardData {
  weekStart: string
  scoreboards: Record<string, Array<{
    user: {
      id: string
      name: string | null
      familyName: string | null
      email: string
      image: string | null
    }
    totalCount: number
    totalPrice: number
  }>>
}

export default function Scoreboard() {
  const { language } = useLanguage()
  const [data, setData] = useState<ScoreboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScoreboard()
  }, [])

  const fetchScoreboard = async () => {
    try {
      const res = await fetch("/api/scoreboard")
      if (res.ok) {
        const data = await res.json()
        setData(data)
      }
    } catch (error) {
      console.error("Error fetching scoreboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading scoreboard...</div>
  }

  if (!data) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">Failed to load scoreboard</div>
  }

  const weekStart = new Date(data.weekStart)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 rounded-lg p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">{t("scoreboard.title", language)}</h2>
        <p className="text-purple-100 dark:text-purple-200">
          {weekStart.toLocaleDateString(language === "th" ? "th-TH" : "en-US")} - {weekEnd.toLocaleDateString(language === "th" ? "th-TH" : "en-US")}
        </p>
        <p className="text-sm text-purple-200 dark:text-purple-300 mt-1">
          {t("scoreboard.reset", language)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEBOREKA_PARTS.map((part) => {
          const scores = data.scoreboards[part] || []
          const partName = PART_TRANSLATIONS[part]?.[language] || part
          const partImage = PART_IMAGES[part]

          return (
            <div key={part} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Image Header */}
              <div className="relative h-32 bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-700 dark:to-indigo-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20"></div>
                <Image
                  src={partImage}
                  alt={partName}
                  width={44}
                  height={44}
                  className="relative z-10 object-contain drop-shadow-2xl rounded-lg border-1 border-yellow-400 bg-white dark:bg-gray-800"
                  unoptimized
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-2xl">👑</span>
                  {partName} {t("scoreboard.leaderboard", language)}
                </h3>
                
                {scores.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t("scoreboard.noData", language)}</p>
                ) : (
                  <div className="space-y-3">
                    {scores.map((entry, index) => (
                      <div
                        key={entry.user.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index === 0
                            ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600"
                            : "bg-gray-50 dark:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0
                                ? "bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-100"
                                : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-gray-100">
                              {entry.user.familyName || entry.user.name || entry.user.email}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {entry.totalCount} {t("scoreboard.enhancements", language)}
                            </div>
                          </div>
                        </div>
                        {index === 0 && (
                          <span className="text-2xl">👑</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
