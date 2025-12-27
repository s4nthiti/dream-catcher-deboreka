"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { useSSE, SSEMessage } from "@/hooks/useSSE"
import { usePolling } from "@/hooks/usePolling"

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

interface Record {
  id: string
  userId: string
  part: string
  fromLevel: string | null
  level: string
  success: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    familyName: string | null
    email: string
    image: string | null
  }
}

export default function RecordsTable() {
  const { language } = useLanguage()
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/records")
      if (res.ok) {
        const data = await res.json()
        setRecords(data)
      }
    } catch (error) {
      console.error("Error fetching records:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()

    // Listen for immediate updates when records are added
    const handleRecordAdded = () => {
      console.log("Record added event received, refreshing immediately...")
      fetchRecords()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('recordAdded', handleRecordAdded)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('recordAdded', handleRecordAdded)
      }
    }
  }, [fetchRecords])

  // Handle SSE messages for real-time updates
  const handleSSEMessage = useCallback((message: SSEMessage) => {
    if (message.event === "enhancement:added") {
      console.log("SSE update received, refreshing records...")
      fetchRecords()
    }
  }, [fetchRecords])

  // Connect to SSE for real-time updates
  useSSE("/api/events", handleSSEMessage, true)

  // Add polling as a fallback (every 30 seconds)
  usePolling(fetchRecords, {
    interval: 30000,
    enabled: true,
  })

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return t("records.justNow", language)
    
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} ${t("records.minutesAgo", language)}`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ${t("records.hoursAgo", language)}`
    
    const days = Math.floor(hours / 24)
    return `${days} ${t("records.daysAgo", language)}`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          {t("records.recentAchievements", language)}
        </h2>
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        {t("records.recentAchievements", language)}
      </h2>

      {records.length === 0 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          {t("records.noRecords", language)}
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, index) => (
            <div
              key={record.id}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                index === 0 && record.success
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600 shadow-lg"
                  : record.success
                  ? "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                  : "bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800"
              }`}
            >
              {/* Part Image */}
              <div className="flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
                  <Image
                    src={PART_IMAGES[record.part]}
                    alt={PART_TRANSLATIONS[record.part]?.[language] || record.part}
                    width={40}
                    height={40}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>

              {/* Level Badge */}
              <div className="flex-shrink-0">
                <div className={`font-bold text-xl px-4 py-2 rounded-lg shadow-md ${
                  record.success
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                    : "bg-gradient-to-br from-red-500 to-rose-600 text-white"
                }`}>
                  {record.success && record.fromLevel ? (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-200">{record.fromLevel}</span>
                      <span className="text-white">→</span>
                      <span>{record.level}</span>
                    </div>
                  ) : (
                    record.level
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                {record.success ? (
                  <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                    <span className="text-lg">✓</span>
                    <span>{t("records.succeeded", language)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm font-semibold">
                    <span className="text-lg">✗</span>
                    <span>{t("records.failed", language)}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {record.user.familyName || record.user.name || record.user.email}
                  </span>
                  {index === 0 && record.success && <span className="text-2xl">🎉</span>}
                  {index === 0 && !record.success && <span className="text-2xl">💔</span>}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {PART_TRANSLATIONS[record.part]?.[language] || record.part} - {
                    record.success && record.fromLevel 
                      ? `${record.fromLevel} → ${record.level}`
                      : `${t("records.level", language)} ${record.level}`
                  }
                </div>
              </div>

              {/* Time */}
              <div className="flex-shrink-0 text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getTimeAgo(record.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

