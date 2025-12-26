"use client"

import { signOut } from "next-auth/react"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"

export default function SignOutButton() {
  const { language } = useLanguage()
  
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
    >
      {t("nav.signOut", language)}
    </button>
  )
}
