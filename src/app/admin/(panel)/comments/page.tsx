import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { adminApi, type AdminComment, type Paged } from "@/lib/admin-api"
import { parsePage, postPath } from "@/lib/blog"
import { fa, faDate } from "@/lib/format"
import { cn } from "@/lib/utils"

import { CommentActions } from "./comment-actions"

export const metadata: Metadata = { title: "دیدگاه‌ها" }

type Status = AdminComment["status"]
type Counts = { all: number } & Record<Status, number>
type Props = PageProps<"/admin/comments">

const STATUS_LABEL: Record<Status, string> = { pending: "در انتظار تأیید", approved: "تأییدشده", spam: "اسپم" }

export default function CommentsPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold">دیدگاه‌ها</h1>
      <p className="text-muted-foreground mt-1 text-sm">دیدگاه‌ها فقط پس از تأیید در سایت نمایش داده می‌شوند.</p>
      <Suspense fallback={<div className="bg-muted mt-8 h-64 animate-pulse rounded-xl" />}>
        <CommentsList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function CommentsList({ searchParams }: Pick<Props, "searchParams">) {
  const params = await searchParams
  // Pending first: that's what needs attention
  const status: Status | undefined =
    params.status === "all" ? undefined : params.status === "approved" || params.status === "spam" ? params.status : "pending"
  const page = parsePage(params.page)

  const query = new URLSearchParams({ page: String(page) })
  if (status) query.set("status", status)
  const data = await adminApi<Paged<AdminComment, Counts>>(`/admin/comments?${query}`)

  const tabs: { key: string; label: string; count: number }[] = [
    { key: "pending", label: STATUS_LABEL.pending, count: data.counts.pending },
    { key: "approved", label: STATUS_LABEL.approved, count: data.counts.approved },
    { key: "spam", label: STATUS_LABEL.spam, count: data.counts.spam },
    { key: "all", label: "همه", count: data.counts.all },
  ]
  const current = status ?? "all"
  const href = (s: string, p = 1) => `/admin/comments?status=${s}${p > 1 ? `&page=${p}` : ""}`

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
          دیدگاهی در این بخش نیست.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {data.items.map((comment) => (
            <li key={comment.id} className="bg-background rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">
                    {comment.authorName}
                    {comment.authorEmail && (
                      <span className="text-muted-foreground ms-2 text-xs font-normal" dir="ltr">{comment.authorEmail}</span>
                    )}
                  </p>
                  <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 text-xs">
                    <span>{faDate(comment.createdAt)}</span>
                    <span>·</span>
                    <span>
                      برای{" "}
                      <Link href={`/admin/posts/${comment.post.id}`} className="text-primary hover:underline">
                        {comment.post.title}
                      </Link>
                    </span>
                    <Button variant="ghost" size="icon" className="size-6" asChild>
                      <Link href={`${postPath(comment.post.slug)}#comments`} target="_blank" aria-label="مشاهده در سایت" title="مشاهده در سایت">
                        <ExternalLink />
                      </Link>
                    </Button>
                  </p>
                </div>
                <Badge
                  variant={comment.status === "approved" ? "default" : comment.status === "spam" ? "destructive" : "secondary"}
                  className={comment.status === "approved" ? "bg-emerald-600" : comment.status === "pending" ? "bg-amber-500 text-white" : undefined}
                >
                  {STATUS_LABEL[comment.status]}
                </Badge>
              </div>
              <p className="mt-3 leading-7 whitespace-pre-line">{comment.content}</p>
              <CommentActions id={comment.id} status={comment.status} />
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
