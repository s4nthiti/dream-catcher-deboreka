import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Allow public access to auth routes
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  // Allow setup page if user is authenticated but doesn't have family name
  if (pathname === "/setup" && isAuthenticated) {
    return NextResponse.next()
  }

  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
