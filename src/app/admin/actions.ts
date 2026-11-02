"use server"

import { updateTag } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ApiError, api } from "@/lib/api"
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin-session"
import { SITE_SETTINGS_TAG, type FooterColumn, type FooterSettings } from "@/lib/site-settings"

export type LoginState = { error?: string; username?: string }

// Only allow redirects back into the admin panel
const safeNext = (value: FormDataEntryValue | null) =>
  typeof value === "string" && value.startsWith("/admin") && !value.startsWith("//")
    ? value
    : "/admin/posts"

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  if (!username || !password) return { error: "نام کاربری و رمز عبور را وارد کنید", username }

  try {
    const { accessToken } = await api<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
    ;(await cookies()).set(ADMIN_COOKIE, accessToken, adminCookieOptions)
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return { error: "تعداد تلاش‌ها زیاد است. یک دقیقه دیگر دوباره امتحان کنید.", username }
    }
    if (error instanceof ApiError && error.status === 401) {
      return { error: "نام کاربری یا رمز عبور اشتباه است", username }
    }
    return { error: "ارتباط با سرور برقرار نشد. بعداً دوباره تلاش کنید.", username }
  }

  redirect(safeNext(formData.get("next")))
}

export async function logout() {
  ;(await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" })
  redirect("/admin/login")
}

export type SaveResult =
  | { ok: true; settings: FooterSettings }
  | { ok: false; errors: string[] }

export async function saveFooterSettings(columns: FooterColumn[]): Promise<SaveResult> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) redirect("/admin/login")

  try {
    const settings = await api<FooterSettings>("/settings/footer", {
      method: "PUT",
      token,
      body: JSON.stringify({ columns }),
    })
    // Show the new footer to visitors right away
    updateTag(SITE_SETTINGS_TAG)
    return { ok: true, settings }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      cookieStore.delete({ name: ADMIN_COOKIE, path: "/admin" })
      redirect("/admin/login?next=/admin/settings")
    }
    if (error instanceof ApiError) return { ok: false, errors: error.messages }
    return { ok: false, errors: ["ارتباط با سرور برقرار نشد. بعداً دوباره تلاش کنید."] }
  }
}
