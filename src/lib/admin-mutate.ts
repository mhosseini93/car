import { updateTag } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { ApiError, api } from "@/lib/api"

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; errors: string[] }

export const NETWORK_ERROR = "ارتباط با سرور برقرار نشد. بعداً دوباره تلاش کنید."

export async function adminToken() {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!value) redirect("/admin/login")
  return value
}

// For Server Actions: runs an admin API call, expires the public cache tag that
// shows this data (if any) and maps errors to messages for the form
export async function adminMutate<T>(path: string, init: RequestInit, tag?: string): Promise<ActionResult<T>> {
  try {
    const data = await api<T>(path, { ...init, token: await adminToken() })
    if (tag) updateTag(tag)
    return { ok: true, data }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/admin/login")
    if (error instanceof ApiError) return { ok: false, errors: error.messages }
    return { ok: false, errors: [NETWORK_ERROR] }
  }
}
