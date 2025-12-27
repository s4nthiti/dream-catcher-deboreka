import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import RecordsPageContent from "@/components/RecordsPageContent"

export default async function RecordsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (!session.user.familyName) {
    redirect("/setup")
  }

  return (
    <RecordsPageContent
      user={{
        familyName: session.user.familyName,
        name: session.user.name,
        isAdmin: session.user.isAdmin || false,
      }}
    />
  )
}

