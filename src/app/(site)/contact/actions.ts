"use server"

import { headers } from "next/headers"

import { ApiError, api } from "@/lib/api"

type ContactValues = { name: string; phone: string; email: string; subject: string; message: string }

// values: what was sent, so the form can refill itself after React resets it on an error
export type ContactState = { status: "idle" | "success" | "error"; errors?: string[]; values?: ContactValues }

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values: ContactValues = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? "other"),
    message: String(formData.get("message") ?? ""),
  }
  const body = { ...values, website: String(formData.get("website") ?? "") }

  // Pass the visitor's IP on so the backend rate-limits per visitor, not per server
  const forwardedFor = (await headers()).get("x-forwarded-for")

  try {
    await api("/contact", {
      method: "POST",
      body: JSON.stringify(body),
      headers: forwardedFor ? { "X-Forwarded-For": forwardedFor } : undefined,
    })
    return { status: "success" }
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return { status: "error", values, errors: ["تعداد پیام‌های ارسالی زیاد است. کمی بعد دوباره تلاش کنید."] }
    }
    if (error instanceof ApiError) return { status: "error", values, errors: error.messages }
    return { status: "error", values, errors: ["ارسال پیام با خطا مواجه شد. لطفاً تماس تلفنی بگیرید یا بعداً دوباره تلاش کنید."] }
  }
}
