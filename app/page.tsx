import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import PageContent from "@/components/PageContent"

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  // Check if user needs to set family name
  if (!session.user.familyName) {
    redirect("/setup")
  }

  return (
    <PageContent
      user={{
        familyName: session.user.familyName,
        name: session.user.name,
        isAdmin: session.user.isAdmin,
      }}
    />
  )
}
