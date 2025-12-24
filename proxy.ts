import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("sms_app_session")
  const isLoginPage = request.nextUrl.pathname === "/login"
  const isApiAuth = request.nextUrl.pathname.startsWith("/api/auth")

  // Allow auth API routes
  if (isApiAuth) {
    return NextResponse.next()
  }

  // If no session and not on login page, redirect to login
  if (!sessionCookie && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If has session and on login page, redirect to dashboard
  if (sessionCookie && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
