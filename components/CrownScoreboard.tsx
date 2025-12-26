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

interface CrownEntry {
  user: {
    id: string
    name: string | null
    familyName: string | null
    email: string
    image: string | null
  }
  crowns: Record<string, number>
  totalCrowns: number
}

export default function CrownScoreboard() {
  const { language } = useLanguage()
  const [data, setData] = useState<CrownEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCrowns()
  }, [])

  const fetchCrowns = async () => {
    try {
      const res = await fetch("/api/crowns")
      if (res.ok) {
        const data = await res.json()
        setData(data)
      }
    } catch (error) {
      console.error("Error fetching crowns:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading crown scoreboard...</div>
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <span className="text-3xl">👑</span>
        {t("crowns.title", language)}
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t("crowns.noData", language)}</p>
      ) : (
        <div className="space-y-4">
          {data.map((entry, index) => (
            <div
              key={entry.user.id}
              className={`p-4 rounded-lg border-2 ${
                index === 0
                  ? "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-400 dark:border-yellow-600"
                  : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0
                        ? "bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-100"
                        : index === 1
                        ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                        : index === 2
                        ? "bg-orange-300 dark:bg-orange-600 text-orange-900 dark:text-orange-100"
                        : "bg-gray-200 dark:bg-gray-500 text-gray-600 dark:text-gray-200"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800 dark:text-gray-100">
                      {entry.user.familyName || entry.user.name || entry.user.email}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t("crowns.total", language)}: {entry.totalCrowns} {entry.totalCrowns !== 1 ? t("crowns.crowns", language) : t("crowns.crown", language)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {DEBOREKA_PARTS.map((part) => {
                    const count = entry.crowns[part] || 0
                    if (count === 0) return null
                    const partName = PART_TRANSLATIONS[part]?.[language] || part
                    const partImage = PART_IMAGES[part]
                    return (
                      <div
                        key={part}
                        className="bg-white dark:bg-gray-600 px-3 py-1 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 flex items-center gap-2"
                      >
                        <Image
                          src={partImage}
                          alt={partName}
                          width={20}
                          height={20}
                          className="object-contain"
                          unoptimized
                        />
                        <span>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
