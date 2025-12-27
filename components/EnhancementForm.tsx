"use client"

import { useState, useRef, useCallback } from "react"
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
  const [count, setCount] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // For hold-to-repeat functionality
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const increment = useCallback((amount: number) => {
    setCount((prev) => prev + amount)
  }, [])

  const decrement = useCallback((amount: number) => {
    setCount((prev) => Math.max(1, prev - amount))
  }, [])

  const startHoldIncrement = useCallback(() => {
    increment(1)
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        increment(1)
      }, 100)
    }, 500)
  }, [increment])

  const startHoldDecrement = useCallback(() => {
    decrement(1)
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        decrement(1)
      }, 100)
    }, 500)
  }, [decrement])

  const stopHold = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

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
          count,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t("enhancement.error", language))
      }

      // Broadcast custom event to trigger immediate refresh in other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('enhancementAdded', { 
          detail: { part, count } 
        }))
      }

      setSuccess(true)
      setPart("")
      setCount(1)
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
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="part" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("enhancement.part", language)}
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
                  width={48}
                  height={48}
                  className="object-contain drop-shadow-lg"
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t("enhancement.count", language)}
          </label>
          
          {/* Count Display / Input */}
          <div className="flex flex-col items-center mb-4">
            <input
              type="number"
              min="1"
              step="1"
              value={count}
              onChange={(e) => {
                const value = e.target.value
                // Allow empty string for editing
                if (value === '') {
                  setCount(0)
                  return
                }
                const numValue = parseInt(value)
                if (!isNaN(numValue) && numValue >= 0) {
                  setCount(numValue)
                }
              }}
              onBlur={(e) => {
                // Ensure minimum value of 1 when input loses focus
                if (count < 1) {
                  setCount(1)
                }
              }}
              onKeyDown={(e) => {
                // Prevent decimal point, minus sign, and 'e'
                if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                  e.preventDefault()
                }
              }}
              className="text-5xl font-bold text-center text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-8 py-4 rounded-xl border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-600 outline-none transition-all w-48 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {language === 'th' ? 'คลิกเพื่อพิมพ์โดยตรง' : 'Click to type directly'}
            </p>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onMouseDown={startHoldDecrement}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={startHoldDecrement}
              onTouchEnd={stopHold}
              disabled={count <= 1}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-2xl py-4 rounded-lg transition-all active:scale-95 shadow-md hover:shadow-lg"
              aria-label="Decrease"
            >
              −
            </button>
            <button
              type="button"
              onMouseDown={startHoldIncrement}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={startHoldIncrement}
              onTouchEnd={stopHold}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold text-2xl py-4 rounded-lg transition-all active:scale-95 shadow-md hover:shadow-lg"
              aria-label="Increase"
            >
              +
            </button>
          </div>

          {/* Quick Increment Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => increment(1)}
              className="flex-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold py-2 rounded-lg transition-all active:scale-95 border border-blue-300 dark:border-blue-700"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => increment(5)}
              className="flex-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold py-2 rounded-lg transition-all active:scale-95 border border-blue-300 dark:border-blue-700"
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => increment(10)}
              className="flex-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold py-2 rounded-lg transition-all active:scale-95 border border-blue-300 dark:border-blue-700"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => setCount(1)}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2 rounded-lg transition-all active:scale-95 border border-gray-300 dark:border-gray-600"
              title="Reset to 1"
            >
              ↻
            </button>
          </div>
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
          disabled={loading || !part || count < 1}
          className="w-full bg-purple-600 dark:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("enhancement.submitting", language) : t("enhancement.submit", language)}
        </button>
      </form>
    </div>
  )
}
