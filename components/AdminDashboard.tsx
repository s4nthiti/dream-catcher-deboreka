"use client"

import { useEffect, useState } from "react"
import { DEBOREKA_PARTS } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"

const PART_TRANSLATIONS: Record<string, { en: string; th: string }> = {
  NECKLACE: { en: "Necklace", th: "สร้อยคอ" },
  EARRING: { en: "Earring", th: "ต่างหู" },
  RING: { en: "Ring", th: "แหวน" },
  BELT: { en: "Belt", th: "เข็มขัด" },
}

interface Enhancement {
  id: string
  userId: string
  part: string
  count: number
  price: number
  weekStartDate: string
  createdAt: string
  user: {
    id: string
    name: string | null
    familyName: string | null
    email: string
  }
}

export default function AdminDashboard() {
  const { language } = useLanguage()
  const [enhancements, setEnhancements] = useState<Enhancement[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchEnhancements()
  }, [])

  const fetchEnhancements = async () => {
    try {
      const res = await fetch("/api/admin/enhancements")
      if (res.ok) {
        const data = await res.json()
        setEnhancements(data.enhancements)
      }
    } catch (error) {
      console.error("Error fetching enhancements:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enhancement?")) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/enhancements?id=${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setEnhancements(enhancements.filter((e) => e.id !== id))
      } else {
        alert("Failed to delete enhancement")
      }
    } catch (error) {
      console.error("Error deleting enhancement:", error)
      alert("Failed to delete enhancement")
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading admin dashboard...</div>
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">{t("admin.title", language)}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{t("admin.description", language)}</p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">{t("admin.user", language)}</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">{t("admin.part", language)}</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">{t("admin.count", language)}</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">{t("admin.date", language)}</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">{t("admin.actions", language)}</th>
            </tr>
          </thead>
          <tbody>
            {enhancements.map((enh) => (
              <tr key={enh.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-gray-200">
                  {enh.user.familyName || enh.user.name || enh.user.email}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-gray-200">
                  {PART_TRANSLATIONS[enh.part]?.[language] || enh.part}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-gray-200">{enh.count}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-gray-200">
                  {new Date(enh.createdAt).toLocaleString(language === "th" ? "th-TH" : "en-US")}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                  <button
                    onClick={() => handleDelete(enh.id)}
                    disabled={deleting === enh.id}
                    className="bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded hover:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting === enh.id ? t("admin.deleting", language) : t("admin.delete", language)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {enhancements.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t("admin.noData", language)}</p>
      )}
    </div>
  )
}
