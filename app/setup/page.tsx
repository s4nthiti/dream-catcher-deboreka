"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"

function SetupContent() {
  const { language } = useLanguage()
  const [familyName, setFamilyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/user/family-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyName }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save family name")
      }

      router.push("/")
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg p-8 shadow-2xl border border-white/20 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t("setup.title", language)}</h1>
          <p className="text-white/80 dark:text-gray-300">{t("setup.description", language)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="familyName" className="block text-white dark:text-gray-200 mb-2 font-medium">
              {t("setup.familyName", language)}
            </label>
            <input
              id="familyName"
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 dark:bg-gray-700/50 border border-white/30 dark:border-gray-600 text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 dark:focus:ring-gray-500 focus:border-transparent"
              placeholder={t("setup.familyName.placeholder", language)}
            />
          </div>

          {error && (
            <div className="bg-red-500/20 dark:bg-red-900/30 border border-red-500/50 dark:border-red-700 text-red-200 dark:text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !familyName.trim()}
            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-6 py-4 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("setup.saving", language) : t("setup.submit", language)}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SetupPage() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SetupContent />
      </LanguageProvider>
    </ThemeProvider>
  )
}
