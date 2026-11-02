import type { Metadata } from "next"
import { Suspense } from "react"
import { AlertCircle } from "lucide-react"

import { api } from "@/lib/api"
import type { FooterSettings } from "@/lib/site-settings"

import { FooterLinksEditor } from "./footer-links-editor"

export const metadata: Metadata = { title: "تنظیمات عمومی" }

export default function GeneralSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-extrabold">تنظیمات عمومی سایت</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        تنظیماتی که در همه صفحات سایت اعمال می‌شوند.
      </p>
      <div className="mt-8">
        <Suspense fallback={<EditorSkeleton />}>
          <FooterSection />
        </Suspense>
      </div>
    </div>
  )
}

async function FooterSection() {
  let settings: FooterSettings
  try {
    // Always read fresh values here, not the cached copy the site uses
    settings = await api<FooterSettings>("/settings/footer", { cache: "no-store" })
  } catch {
    return (
      <p
        role="alert"
        className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg p-4 text-sm"
      >
        <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
        ارتباط با سرور برقرار نشد. مطمئن شوید بک‌اند در حال اجراست.
      </p>
    )
  }
  return <FooterLinksEditor initial={settings} />
}

function EditorSkeleton() {
  return (
    <div className="bg-background animate-pulse rounded-xl border p-6">
      <div className="bg-muted h-5 w-40 rounded" />
      <div className="bg-muted mt-6 h-32 rounded-lg" />
      <div className="bg-muted mt-4 h-32 rounded-lg" />
    </div>
  )
}
