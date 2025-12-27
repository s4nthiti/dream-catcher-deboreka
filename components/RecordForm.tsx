"use client"

import { useState } from "react"
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

const SUCCESS_LEVELS = ['I', 'II', 'III', 'IV', 'V']
const FAILED_LEVELS = ['0', 'I', 'II', 'III', 'IV']

// Map to get previous level (for display)
const getPreviousLevel = (to: string): string => {
  const levelMap: Record<string, string> = {
    'I': '0',
    'II': 'I',
    'III': 'II',
    'IV': 'III',
    'V': 'IV'
  }
  return levelMap[to] || '0'
}

export default function RecordForm() {
  const { language } = useLanguage()
  const [part, setPart] = useState<string>("")
  const [level, setLevel] = useState<string>("")
  const [succeeded, setSucceeded] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSuccessToggle = (newSucceeded: boolean) => {
    setSucceeded(newSucceeded)
    // Reset level if it's not available in the new mode
    const availableLevels = newSucceeded ? SUCCESS_LEVELS : FAILED_LEVELS
    if (level && !availableLevels.includes(level)) {
      setLevel("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const fromLevel = succeeded ? getPreviousLevel(level) : null
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part,
          fromLevel,
          level,
          success: succeeded,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t("records.error", language))
      }

      // Broadcast custom event to trigger immediate refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('recordAdded', { 
          detail: { part, fromLevel, level, success: succeeded } 
        }))
      }

      setSuccess(true)
      setPart("")
      setLevel("")
      setSucceeded(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="part" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("records.selectPart", language)}
          </label>
          <div className="flex gap-3 items-center">
            <select
              id="part"
              value={part}
              onChange={(e) => setPart(e.target.value)}
              required
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">{t("enhancement.part.select", language)}</option>
              {DEBOREKA_PARTS.map((p) => (
                <option key={p} value={p}>
                  {PART_TRANSLATIONS[p]?.[language] || p}
                </option>
              ))}
            </select>
            {part && (
              <div className="flex-shrink-0 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg border border-purple-200 dark:border-purple-700">
                <Image
                  src={PART_IMAGES[part]}
                  alt={PART_TRANSLATIONS[part]?.[language] || part}
                  width={40}
                  height={40}
                  className="object-contain drop-shadow-lg"
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>

        {/* Result Selection - Show first to determine if we need from/to */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("records.result", language)}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSuccessToggle(true)}
              className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                succeeded
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <span className="text-2xl">✓</span>
              <span>{t("records.succeeded", language)}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSuccessToggle(false)}
              className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                !succeeded
                  ? "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <span className="text-2xl">✗</span>
              <span>{t("records.failed", language)}</span>
            </button>
          </div>
        </div>

        {/* Level Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {succeeded ? t("records.toLevel", language) : t("records.selectLevel", language)}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(succeeded ? SUCCESS_LEVELS : FAILED_LEVELS).map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => setLevel(lv)}
                className={`py-3 px-4 rounded-lg font-bold text-lg transition-all ${
                  level === lv
                    ? succeeded
                      ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg scale-105"
                      : "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {succeeded && (
                  <div className="text-xs text-blue-300 mb-1">{getPreviousLevel(lv)} →</div>
                )}
                <div>{lv}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
            {t("records.success", language)}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !part || !level}
          className="w-full bg-purple-600 dark:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("records.submitting", language) : t("records.submit", language)}
        </button>
      </form>
    </div>
  )
}

