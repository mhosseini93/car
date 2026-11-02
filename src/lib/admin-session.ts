export const ADMIN_COOKIE = "admin_token"

// Scoped to /admin so the token is never sent with public page requests
export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/admin",
  maxAge: 8 * 60 * 60, // matches the backend token lifetime
}

// Reads the JWT expiry without verifying it; the backend does the real check
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
    return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}
