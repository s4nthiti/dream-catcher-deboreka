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

export default function EnhancementForm() {
  const { language } = useLanguage()
  const [part, setPart] = useState<string>("")
  const [count, setCount] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch("/api/enhancements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part,
          count: parseInt(count),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t("enhancement.error", language))
      }

      setSuccess(true)
      setPart("")
      setCount("")
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t("enhancement.title", language)}
        </h2>
        {part && (
          <div className="w-16 h-16 relative">
            <Image
              src={PART_IMAGES[part]}
              alt={PART_TRANSLATIONS[part]?.[language] || part}
              width={16}
              height={16}
              className="object-contain drop-shadow-lg"
              unoptimized
            />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="part" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("enhancement.part", language)}
          </label>
          <select
            id="part"
            value={part}
            onChange={(e) => setPart(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">{t("enhancement.part.select", language)}</option>
            {DEBOREKA_PARTS.map((p) => (
              <option key={p} value={p}>
                {PART_TRANSLATIONS[p]?.[language] || p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("enhancement.count", language)}
          </label>
          <input
            id="count"
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={t("enhancement.count.placeholder", language)}
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
            {t("enhancement.success", language)}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !part || !count}
          className="w-full bg-purple-600 dark:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("enhancement.submitting", language) : t("enhancement.submit", language)}
        </button>
      </form>
    </div>
  )
}
