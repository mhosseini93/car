import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ExternalLink, Pencil, Plus, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminApi, type AdminPostRow, type Paged } from "@/lib/admin-api"
import { parsePage, postPath } from "@/lib/blog"
import { fa, faDate } from "@/lib/format"
import { cn } from "@/lib/utils"

import { DeletePostButton } from "./delete-post-button"

export const metadata: Metadata = { title: "مقالات" }

type Counts = { all: number; published: number; draft: number }
type Props = PageProps<"/admin/posts">

export default function AdminPostsPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">مقالات</h1>
          <p className="text-muted-foreground mt-1 text-sm">مدیریت مقالات بلاگ</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus aria-hidden="true" />
            مقاله جدید
          </Link>
        </Button>
      </div>
      <Suspense fallback={<div className="bg-muted mt-8 h-64 animate-pulse rounded-xl" />}>
        <PostsTable searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function PostsTable({ searchParams }: Pick<Props, "searchParams">) {
  const params = await searchParams
  const status = params.status === "draft" || params.status === "published" ? params.status : undefined
  const q = typeof params.q === "string" ? params.q.trim() : ""
  const page = parsePage(params.page)

  const query = new URLSearchParams({ page: String(page) })
  if (status) query.set("status", status)
  if (q) query.set("q", q)
  const data = await adminApi<Paged<AdminPostRow, Counts>>(`/admin/posts?${query}`)

  const href = (next: { status?: string; page?: number }) => {
    const p = new URLSearchParams()
    const s = "status" in next ? next.status : status
    if (s) p.set("status", s)
    if (q) p.set("q", q)
    if (next.page && next.page > 1) p.set("page", String(next.page))
    const str = p.toString()
    return `/admin/posts${str ? `?${str}` : ""}`
  }

  const tabs = [
    { key: undefined, label: "همه", count: data.counts.all },
    { key: "published", label: "منتشرشده", count: data.counts.published },
    { key: "draft", label: "پیش‌نویس", count: data.counts.draft },
  ]

  return (
    <div className="bg-background mt-8 rounded-xl border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <nav aria-label="فیلتر وضعیت" className="flex gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={href({ status: tab.key })}
              aria-current={status === tab.key ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                status === tab.key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {tab.label} <span className="opacity-70">({fa(tab.count)})</span>
            </Link>
          ))}
        </nav>
        <form action="/admin/posts" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <Input name="q" defaultValue={q} placeholder="جستجو در عنوان یا نامک" aria-label="جستجو" className="w-56" />
          <Button type="submit" variant="outline" size="icon" aria-label="جستجو">
            <Search />
          </Button>
        </form>
      </div>

      {data.items.length === 0 ? (
        <p className="text-muted-foreground p-10 text-center text-sm">
          {q ? "مقاله‌ای با این عبارت پیدا نشد." : "هنوز مقاله‌ای ننوشته‌اید."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>ربات‌ها</TableHead>
              <TableHead>دسته‌بندی</TableHead>
              <TableHead>دیدگاه</TableHead>
              <TableHead>آخرین ویرایش</TableHead>
              <TableHead className="w-28"><span className="sr-only">عملیات</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="max-w-72">
                  <Link href={`/admin/posts/${post.id}`} className="hover:text-primary block truncate font-medium">
                    {post.title}
                  </Link>
                  <span className="text-muted-foreground block truncate text-xs" dir="ltr">/blog/{post.slug}</span>
                </TableCell>
                <TableCell>
                  {post.status === "published" ? (
                    post.publishedAt && new Date(post.publishedAt) > new Date() ? (
                      <Badge variant="outline">زمان‌بندی‌شده</Badge>
                    ) : (
                      <Badge className="bg-emerald-600">منتشرشده</Badge>
                    )
                  ) : (
                    <Badge variant="secondary">پیش‌نویس</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Badge variant={post.robotsIndex ? "outline" : "destructive"} className="font-mono" dir="ltr">
                      {post.robotsIndex ? "index" : "noindex"}
                    </Badge>
                    <Badge variant={post.robotsFollow ? "outline" : "destructive"} className="font-mono" dir="ltr">
                      {post.robotsFollow ? "follow" : "nofollow"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-40 truncate text-xs">
                  {post.categories.map((c) => c.name).join("، ") || "—"}
                </TableCell>
                <TableCell>
                  <Link href="/admin/comments" className="text-sm">
                    {fa(post.commentCount)}
                    {post.pendingComments > 0 && (
                      <Badge className="ms-1 bg-amber-500">{fa(post.pendingComments)} جدید</Badge>
                    )}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{faDate(post.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/posts/${post.id}`} aria-label={`ویرایش ${post.title}`} title="ویرایش">
                        <Pencil />
                      </Link>
                    </Button>
                    {post.status === "published" && (
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={postPath(post.slug)} target="_blank" aria-label={`مشاهده ${post.title}`} title="مشاهده">
                          <ExternalLink />
                        </Link>
                      </Button>
                    )}
                    <DeletePostButton id={post.id} title={post.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {data.totalPages > 1 && (
        <nav aria-label="صفحه‌بندی" className="flex justify-center gap-1 border-t p-3">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={p === data.page ? "default" : "ghost"} size="sm" asChild>
              <Link href={href({ page: p })}>{fa(p)}</Link>
            </Button>
          ))}
        </nav>
      )}
    </div>
  )
}
