import Link from "next/link"
import { ChevronLeft, ChevronRight, FileSearch } from "lucide-react"

import { Button } from "@/components/ui/button"
import { categoryPath, type CategoryWithCount, type PostPage } from "@/lib/blog"
import { fa } from "@/lib/format"
import { cn } from "@/lib/utils"

import { PostCard } from "./post-card"

export function PostGrid({ data, featureFirst }: { data: PostPage; featureFirst?: boolean }) {
  if (!data.items.length) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
        <FileSearch className="size-10" aria-hidden="true" />
        <p>هنوز مقاله‌ای منتشر نشده است.</p>
      </div>
    )
  }

  const [first, ...rest] = data.items
  const showFeatured = featureFirst && data.page === 1

  return (
    <div className="grid gap-6">
      {showFeatured && <PostCard post={first} featured />}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(showFeatured ? rest : data.items).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

export function Pagination({ basePath, page, totalPages }: { basePath: string; page: number; totalPages: number }) {
  if (totalPages <= 1) return null
  const href = (p: number) => (p === 1 ? basePath : `${basePath}?page=${p}`)

  return (
    <nav aria-label="صفحه‌بندی" className="mt-12 flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" asChild={page > 1} disabled={page <= 1}>
        {page > 1 ? (
          <Link href={href(page - 1)} rel="prev">
            <ChevronRight aria-hidden="true" />
            قبلی
          </Link>
        ) : (
          <span>
            <ChevronRight aria-hidden="true" />
            قبلی
          </span>
        )}
      </Button>
      <ol className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <li key={p}>
            <Button variant={p === page ? "default" : "ghost"} size="icon" asChild>
              <Link href={href(p)} aria-current={p === page ? "page" : undefined} aria-label={`صفحه ${fa(p)}`}>
                {fa(p)}
              </Link>
            </Button>
          </li>
        ))}
      </ol>
      <Button variant="outline" size="sm" asChild={page < totalPages} disabled={page >= totalPages}>
        {page < totalPages ? (
          <Link href={href(page + 1)} rel="next">
            بعدی
            <ChevronLeft aria-hidden="true" />
          </Link>
        ) : (
          <span>
            بعدی
            <ChevronLeft aria-hidden="true" />
          </span>
        )}
      </Button>
    </nav>
  )
}

export function CategoryNav({ categories, activeSlug }: { categories: CategoryWithCount[]; activeSlug?: string }) {
  const visible = categories.filter((c) => c.postCount > 0)
  if (!visible.length) return null

  const chip = "rounded-full border px-4 py-1.5 text-sm transition-colors"
  return (
    <nav aria-label="دسته‌بندی‌های بلاگ">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href="/blog"
            aria-current={!activeSlug ? "page" : undefined}
            className={cn(chip, !activeSlug ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted")}
          >
            همه مقالات
          </Link>
        </li>
        {visible.map((category) => {
          const active = category.slug === activeSlug
          return (
            <li key={category.id}>
              <Link
                href={categoryPath(category.slug)}
                aria-current={active ? "page" : undefined}
                className={cn(chip, active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted")}
              >
                {category.name}
                <span className="ms-1.5 opacity-70">{fa(category.postCount)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function ListSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border">
          <div className="bg-muted aspect-video" />
          <div className="grid gap-3 p-5">
            <div className="bg-muted h-5 w-3/4 rounded" />
            <div className="bg-muted h-4 rounded" />
            <div className="bg-muted h-4 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
