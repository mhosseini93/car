"use server"

import { redirect } from "next/navigation"

import type { AdminCategory, AdminPost, AdminPostInput } from "@/lib/admin-api"
import { adminMutate, adminToken, NETWORK_ERROR, type ActionResult } from "@/lib/admin-mutate"
import { API_URL } from "@/lib/api"
import { BLOG_TAG } from "@/lib/blog-paths"

export type { ActionResult } from "@/lib/admin-mutate"

// Admin API call that also refreshes the public blog cache
const mutate = <T,>(path: string, init: RequestInit) => adminMutate<T>(path, init, BLOG_TAG)

export async function savePost(id: number | null, input: AdminPostInput) {
  return mutate<AdminPost>(id ? `/admin/posts/${id}` : "/admin/posts", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  })
}

export async function deletePost(id: number) {
  return mutate(`/admin/posts/${id}`, { method: "DELETE" })
}

export async function saveCategory(
  id: number | null,
  input: { name: string; slug: string; description: string }
) {
  return mutate<AdminCategory>(id ? `/admin/categories/${id}` : "/admin/categories", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  })
}

export async function deleteCategory(id: number) {
  return mutate(`/admin/categories/${id}`, { method: "DELETE" })
}

export async function setCommentStatus(id: number, status: "pending" | "approved" | "spam") {
  return mutate(`/admin/comments/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })
}

export async function deleteComment(id: number) {
  return mutate(`/admin/comments/${id}`, { method: "DELETE" })
}

// Multipart upload, so it calls fetch directly instead of the JSON api() helper
export async function uploadImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) return { ok: false, errors: ["فایلی انتخاب نشده است"] }
  if (file.size > 5 * 1024 * 1024) return { ok: false, errors: ["حجم تصویر حداکثر ۵ مگابایت است"] }

  const body = new FormData()
  body.append("file", file)

  try {
    const res = await fetch(`${API_URL}/admin/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${await adminToken()}` },
      body,
    })
    if (res.status === 401) redirect("/admin/login")
    const json = (await res.json()) as { url?: string; message?: string | string[] }
    if (!res.ok || !json.url) {
      const message = json.message ?? "بارگذاری تصویر ناموفق بود"
      return { ok: false, errors: Array.isArray(message) ? message : [message] }
    }
    return { ok: true, data: { url: json.url } }
  } catch (error) {
    if (error instanceof Error && "digest" in error) throw error // redirect()
    return { ok: false, errors: [NETWORK_ERROR] }
  }
}
