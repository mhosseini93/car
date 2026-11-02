"use server"

import { headers } from "next/headers"

import { ApiError, api } from "@/lib/api"

export type CommentState = { status: "idle" | "success" | "error"; errors?: string[] }

export async function submitComment(
  slug: string,
  _prev: CommentState,
  formData: FormData
): Promise<CommentState> {
  const body = {
    authorName: String(formData.get("authorName") ?? ""),
    authorEmail: String(formData.get("authorEmail") ?? ""),
    content: String(formData.get("content") ?? ""),
    website: String(formData.get("website") ?? ""),
  }

  // Pass the visitor's IP on so the backend rate-limits per visitor, not per server
  const forwardedFor = (await headers()).get("x-forwarded-for")

  try {
    await api(`/blog/posts/${encodeURIComponent(slug)}/comments`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: forwardedFor ? { "X-Forwarded-For": forwardedFor } : undefined,
    })
    return { status: "success" }
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return { status: "error", errors: ["تعداد دیدگاه‌های ارسالی زیاد است. کمی بعد دوباره تلاش کنید."] }
    }
    if (error instanceof ApiError) return { status: "error", errors: error.messages }
    return { status: "error", errors: ["ارسال دیدگاه با خطا مواجه شد. بعداً دوباره تلاش کنید."] }
  }
}
