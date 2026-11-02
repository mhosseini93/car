import { NextResponse, type NextRequest } from "next/server"

import { ADMIN_COOKIE, isTokenExpired } from "@/lib/admin-session"

// Sends visitors without a valid admin session to the login page
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (pathname === "/admin/login") return NextResponse.next()

  const token = request.cookies.get(ADMIN_COOKIE)?.value
  if (token && !isTokenExpired(token)) return NextResponse.next()

  const loginUrl = new URL("/admin/login", request.url)
  loginUrl.searchParams.set("next", pathname + search)
  const response = NextResponse.redirect(loginUrl)
  if (token) response.cookies.delete({ name: ADMIN_COOKIE, path: "/admin" })
  return response
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
