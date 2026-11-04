import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Mail, Phone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { adminApi, type AdminContactMessage, type Paged } from "@/lib/admin-api"
import { parsePage } from "@/lib/blog"
import { contactSubjectLabel } from "@/lib/contact"
import { fa, faDate } from "@/lib/format"
import { cn } from "@/lib/utils"

import { MessageActions } from "./message-actions"

export const metadata: Metadata = { title: "پیام‌های تماس" }

type Counts = { all: number; unread: number; read: number }
type Props = PageProps<"/admin/messages">

export default function MessagesPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold">پیام‌های تماس</h1>
      <p className="text-muted-foreground mt-1 text-sm">پیام‌هایی که از فرم صفحه «تماس با ما» ارسال شده‌اند.</p>
      <Suspense fallback={<div className="bg-muted mt-8 h-64 animate-pulse rounded-xl" />}>
        <MessagesList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function MessagesList({ searchParams }: Pick<Props, "searchParams">) {
  const params = await searchParams
  // Unread first: that's what needs follow-up
  const status = params.status === "all" ? undefined : params.status === "read" ? "read" : "unread"
  const page = parsePage(params.page)

  const query = new URLSearchParams({ page: String(page) })
  if (status) query.set("status", status)
  const data = await adminApi<Paged<AdminContactMessage, Counts>>(`/admin/contact?${query}`)

  const tabs = [
    { key: "unread", label: "پیگیری‌نشده", count: data.counts.unread },
    { key: "read", label: "پیگیری‌شده", count: data.counts.read },
    { key: "all", label: "همه", count: data.counts.all },
  ]
  const current = status ?? "all"
  const href = (s: string, p = 1) => `/admin/messages?status=${s}${p > 1 ? `&page=${p}` : ""}`

  return (
    <div className="mt-8">
      <nav aria-label="فیلتر وضعیت" className="flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={href(tab.key)}
            aria-current={current === tab.key ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm",
              current === tab.key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {tab.label} <span className="opacity-70">({fa(tab.count)})</span>
          </Link>
        ))}
      </nav>

      {data.items.length === 0 ? (
        <p className="bg-background text-muted-foreground mt-4 rounded-xl border p-10 text-center text-sm">
          پیامی در این بخش نیست.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {data.items.map((message) => (
            <li key={message.id} className={cn("bg-background rounded-xl border p-4", !message.isRead && "border-primary/40")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">{message.name}</p>
                  <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <a href={`tel:${message.phone}`} className="text-primary flex items-center gap-1 hover:underline" dir="ltr">
                      <Phone className="size-3.5" aria-hidden="true" />
                      {message.phone}
                    </a>
                    {message.email && (
                      <a href={`mailto:${message.email}`} className="flex items-center gap-1 hover:underline" dir="ltr">
                        <Mail className="size-3.5" aria-hidden="true" />
                        {message.email}
                      </a>
                    )}
                    <span>{faDate(message.createdAt)}</span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <Badge variant="outline">{contactSubjectLabel(message.subject)}</Badge>
                  {!message.isRead && <Badge className="bg-amber-500 text-white">جدید</Badge>}
                </div>
              </div>
              <p className="mt-3 leading-7 whitespace-pre-line">{message.message}</p>
              <MessageActions id={message.id} isRead={message.isRead} />
            </li>
          ))}
        </ul>
      )}

      {data.totalPages > 1 && (
        <nav aria-label="صفحه‌بندی" className="mt-6 flex justify-center gap-1">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={p === data.page ? "default" : "ghost"} size="sm" asChild>
              <Link href={href(current, p)}>{fa(p)}</Link>
            </Button>
          ))}
        </nav>
      )}
    </div>
  )
}
