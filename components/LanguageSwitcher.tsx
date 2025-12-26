"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { Language } from "@/lib/i18n"

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          language === "en"
            ? "bg-purple-600 text-white"
            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("th")}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          language === "th"
            ? "bg-purple-600 text-white"
            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        TH
      </button>
    </div>
  )
}

