"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import ThemeSwitcher from "@/components/ThemeSwitcher"
import SignOutButton from "@/components/SignOutButton"
import RecordForm from "@/components/RecordForm"
import RecordsTable from "@/components/RecordsTable"

interface RecordsPageContentProps {
  user: {
    familyName: string | null
    name: string | null
    isAdmin: boolean
  }
}

export default function RecordsPageContent({ user }: RecordsPageContentProps) {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Dream Catcher Company
              </h1>
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/"
                  className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("nav.dashboard", language)}
                </Link>
                <Link
                  href="/records"
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white transition-colors"
                >
                  {t("nav.records", language)}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <span className="text-gray-700 dark:text-gray-300">
                {user.familyName || user.name}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {t("records.title", language)}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("records.myProgress", language)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <RecordForm />
          </div>
          <div className="lg:col-span-2">
            <RecordsTable />
          </div>
        </div>
      </main>
    </div>
  )
}

