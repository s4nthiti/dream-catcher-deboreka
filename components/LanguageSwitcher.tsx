"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Language } from "@/lib/i18n"

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering active state until mounted
  if (!mounted) {
    return (
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shadow-sm">
        <button
          disabled
          className="px-3 py-1.5 text-sm font-semibold rounded-md bg-transparent text-gray-700 dark:text-gray-300"
        >
          EN
        </button>
        <button
          disabled
          className="px-3 py-1.5 text-sm font-semibold rounded-md bg-transparent text-gray-700 dark:text-gray-300"
        >
          TH
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shadow-sm">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${
          language === "en"
            ? "bg-purple-600 text-white shadow-md"
            : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600"
        }`}
        title="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("th")}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${
          language === "th"
            ? "bg-purple-600 text-white shadow-md"
            : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600"
        }`}
        title="Switch to Thai (สลับเป็นภาษาไทย)"
      >
        TH
      </button>
    </div>
  )
}

