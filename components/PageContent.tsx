"use client"

import EnhancementForm from "@/components/EnhancementForm"
import Scoreboard from "@/components/Scoreboard"
import CrownScoreboard from "@/components/CrownScoreboard"
import AdminDashboard from "@/components/AdminDashboard"
import SignOutButton from "@/components/SignOutButton"
import ThemeSwitcher from "@/components/ThemeSwitcher"
import LanguageSwitcher from "@/components/LanguageSwitcher"

interface PageContentProps {
  user: {
    familyName: string | null
    name: string | null
    isAdmin: boolean
  }
}

export default function PageContent({ user }: PageContentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Dream Catcher
              </h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Scoreboard />
          </div>
          <div>
            <EnhancementForm />
          </div>
        </div>

        <div className="mb-8">
          <CrownScoreboard />
        </div>

        {user.isAdmin && (
          <div>
            <AdminDashboard />
          </div>
        )}
      </main>
    </div>
  )
}

