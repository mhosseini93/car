"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ExternalLink,
  FolderTree,
  ImagePlus,
  Link2,
  MessagesSquare,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
} from "lucide-react"

import { Counter, FormAlert, ImagePicker, RobotsCard, SwitchRow, useEditorShortcuts } from "@/components/admin/form-parts"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AdminCategory, AdminPost, AdminPostInput, AdminPostOption } from "@/lib/admin-api"
import { postPath } from "@/lib/blog-paths"
import { fa, faDate } from "@/lib/format"
import { siteConfig } from "@/lib/site"
import { SLUG_PATTERN, slugify } from "@/lib/slug"

import { saveCategory, savePost } from "../../blog-actions"
import { DeletePostButton } from "./delete-post-button"

const EMPTY: AdminPostInput = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: null,
  coverImageAlt: "",
  status: "draft",
  publishedAt: null,
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  robotsIndex: true,
  robotsFollow: true,
  allowComments: true,
  categoryIds: [],
  relatedIds: [],
}

// Only the editable fields, in a fixed key order so dirty checks compare cleanly
const toInput = (post: AdminPost): AdminPostInput =>
  Object.fromEntries(Object.keys(EMPTY).map((key) => [key, post[key as keyof AdminPostInput]])) as AdminPostInput

// <input type="datetime-local"> works in local time without a zone
const toLocalInput = (iso: string | null) => {
  if (!iso) return ""
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

export function PostEditor({
  post,
  categories: initialCategories,
  postOptions,
}: {
  post: AdminPost | null
  categories: AdminCategory[]
  postOptions: AdminPostOption[]
}) {
  const router = useRouter()
  const initial = React.useMemo(() => (post ? toInput(post) : EMPTY), [post])
  const [form, setForm] = React.useState<AdminPostInput>(initial)
  const [saved, setSaved] = React.useState(() => JSON.stringify(initial))
  const [slugTouched, setSlugTouched] = React.useState(!!post)
  const [categories, setCategories] = React.useState(initialCategories)
  const [errors, setErrors] = React.useState<string[]>([])
  const [notice, setNotice] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const topBarRef = React.useRef<HTMLDivElement>(null)

  // Keep the editor toolbar pinned just below the (possibly wrapping) top bar
  React.useEffect(() => {
    const bar = topBarRef.current
    if (!bar) return
    const observer = new ResizeObserver(() => {
      rootRef.current?.style.setProperty("--editor-toolbar-top", `${bar.offsetHeight}px`)
    })
    observer.observe(bar)
    return () => observer.disconnect()
  }, [])

  const dirty = JSON.stringify(form) !== saved
  const set = <K extends keyof AdminPostInput>(key: K, value: AdminPostInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setNotice(null)
  }

  const save = React.useCallback(
    (status: AdminPostInput["status"] = form.status) => {
      const payload = { ...form, status }
      const problems: string[] = []
      if (!payload.title.trim()) problems.push("عنوان مقاله را وارد کنید")
      if (!SLUG_PATTERN.test(payload.slug)) problems.push("نامک معتبر نیست (حروف کوچک انگلیسی/فارسی، عدد و خط تیره)")
      if (payload.coverImageUrl && !payload.coverImageAlt.trim()) problems.push("برای تصویر شاخص متن جایگزین (alt) بنویسید")
      setErrors(problems)
      if (problems.length) return

      startTransition(async () => {
        const result = await savePost(post?.id ?? null, payload)
        if (!result.ok) {
          setErrors(result.errors)
          return
        }
        const next = toInput(result.data)
        setForm(next)
        setSaved(JSON.stringify(next))
        setErrors([])
        setNotice(status === "published" ? "مقاله منتشر شد و در سایت به‌روز شد." : "پیش‌نویس ذخیره شد.")
        if (!post) router.replace(`/admin/posts/${result.data.id}`)
        else router.refresh()
      })
    },
    [form, post, router]
  )

  useEditorShortcuts(dirty, save, pending)

  const isPublished = post?.status === "published"
  const scheduled = form.status === "published" && form.publishedAt && new Date(form.publishedAt) > new Date()

  return (
    <div ref={rootRef} className="mx-auto max-w-7xl">
      {/* Top bar */}
      <div
        ref={topBarRef}
        className="bg-background/95 sticky top-0 z-20 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/posts" aria-label="بازگشت به مقالات">
              <ArrowRight />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold">{post ? "ویرایش مقاله" : "مقاله جدید"}</h1>
            <p className="text-muted-foreground text-xs">
              {dirty ? "تغییرات ذخیره‌نشده" : post ? `آخرین ذخیره: ${faDate(post.updatedAt)}` : "هنوز ذخیره نشده"}
              {" · "}Ctrl+S برای ذخیره
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPublished && post && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={postPath(post.slug)} target="_blank">
                <ExternalLink aria-hidden="true" />
                مشاهده
              </Link>
            </Button>
          )}
          {form.status === "published" ? (
            <>
              <Button variant="outline" size="sm" disabled={pending} onClick={() => save("draft")}>
                تبدیل به پیش‌نویس
              </Button>
              <Button size="sm" disabled={pending || (!dirty && !!post)} onClick={() => save("published")}>
                <Save aria-hidden="true" />
                {pending ? "در حال ذخیره..." : "به‌روزرسانی"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" disabled={pending || (!dirty && !!post)} onClick={() => save("draft")}>
                <Save aria-hidden="true" />
                ذخیره پیش‌نویس
              </Button>
              <Button size="sm" disabled={pending} onClick={() => save("published")}>
                <Send aria-hidden="true" />
                {pending ? "در حال ذخیره..." : "انتشار"}
              </Button>
            </>
          )}
        </div>
      </div>

      <FormAlert errors={errors} notice={notice} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Main column */}
        <div className="grid min-w-0 content-start gap-6">
          <Card>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="post-title">عنوان مقاله</Label>
                <Input
                  id="post-title"
                  value={form.title}
                  maxLength={200}
                  placeholder="مثلاً: راهنمای کامل خرید اقساطی خودرو"
                  className="h-12 text-lg font-bold"
                  onChange={(e) => {
                    const title = e.target.value
                    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }))
                    setNotice(null)
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="post-slug">نامک (آدرس)</Label>
                <div className="flex items-center overflow-hidden rounded-md border focus-within:ring-[3px] focus-within:ring-ring/50" dir="ltr">
                  <span className="bg-muted text-muted-foreground border-r px-3 py-2 text-xs whitespace-nowrap">/blog/</span>
                  <input
                    id="post-slug"
                    value={form.slug}
                    maxLength={150}
                    dir="auto"
                    className="h-9 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                    onChange={(e) => {
                      setSlugTouched(true)
                      set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))
                    }}
                  />
                  <button
                    type="button"
                    className="text-primary px-3 text-xs whitespace-nowrap hover:underline"
                    onClick={() => {
                      setSlugTouched(false)
                      set("slug", slugify(form.title))
                    }}
                  >
                    ساخت از عنوان
                  </button>
                </div>
                {form.slug && !SLUG_PATTERN.test(form.slug) && (
                  <p className="text-destructive text-xs">فقط حروف کوچک انگلیسی، حروف فارسی، عدد و خط تیره مجاز است.</p>
                )}
                {isPublished && post && form.slug !== post.slug && (
                  <p className="flex items-center gap-1 text-xs text-amber-700">
                    <AlertTriangle className="size-3.5" />
                    تغییر نامک مقاله منتشرشده لینک‌های قبلی را خراب می‌کند.
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="post-excerpt">خلاصه</Label>
                <Textarea
                  id="post-excerpt"
                  value={form.excerpt}
                  maxLength={500}
                  rows={3}
                  placeholder="یکی دو جمله که در لیست مقالات و زیر عنوان نمایش داده می‌شود"
                  onChange={(e) => set("excerpt", e.target.value)}
                />
                <Counter value={form.excerpt.length} max={500} />
              </div>
            </CardContent>
          </Card>

          <RichTextEditor value={form.content} onChange={(html) => set("content", html)} />

          <SeoCard form={form} set={set} />
        </div>

        {/* Sidebar */}
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">انتشار</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">وضعیت</span>
                {form.status === "published" ? (
                  scheduled ? <Badge variant="outline">زمان‌بندی‌شده</Badge> : <Badge className="bg-emerald-600">منتشرشده</Badge>
                ) : (
                  <Badge variant="secondary">پیش‌نویس</Badge>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="post-date">تاریخ انتشار</Label>
                <Input
                  id="post-date"
                  type="datetime-local"
                  dir="ltr"
                  value={toLocalInput(form.publishedAt)}
                  onChange={(e) => set("publishedAt", e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
                <p className="text-muted-foreground text-xs">
                  {form.publishedAt
                    ? `${faDate(form.publishedAt)}${scheduled ? " — تا این زمان در سایت نمایش داده نمی‌شود" : ""}`
                    : "خالی = زمان انتشار"}
                </p>
              </div>
              {post && (
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-muted-foreground text-xs">زمان مطالعه: {fa(post.readingMinutes)} دقیقه</span>
                  <DeletePostButton id={post.id} title={post.title} redirectTo="/admin/posts" />
                </div>
              )}
            </CardContent>
          </Card>

          <RobotsCard
            index={form.robotsIndex}
            follow={form.robotsFollow}
            subject="این مقاله"
            onChange={(value) => {
              setForm((f) => ({ ...f, ...value }))
              setNotice(null)
            }}
          />
          <CoverCard form={form} set={set} />
          <CategoriesCard
            categories={categories}
            selected={form.categoryIds}
            onChange={(ids) => set("categoryIds", ids)}
            onCreated={(category) => {
              setCategories((list) => [...list, category].sort((a, b) => a.name.localeCompare(b.name, "fa")))
              set("categoryIds", [...form.categoryIds, category.id])
            }}
          />
          <RelatedCard
            options={postOptions.filter((o) => o.id !== post?.id)}
            selected={form.relatedIds}
            onChange={(ids) => set("relatedIds", ids)}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessagesSquare className="text-primary size-4" />
                دیدگاه‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <SwitchRow
                id="allow-comments"
                checked={form.allowComments}
                onChange={(v) => set("allowComments", v)}
                label="امکان ارسال دیدگاه"
              />
              {post && (
                <Link href="/admin/comments" className="text-primary text-xs hover:underline">
                  مدیریت دیدگاه‌ها
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

type SetField = <K extends keyof AdminPostInput>(key: K, value: AdminPostInput[K]) => void

function SeoCard({ form, set }: { form: AdminPostInput; set: SetField }) {
  const title = form.metaTitle || `${form.title || "عنوان مقاله"} | ${siteConfig.name}`
  const description = form.metaDescription || form.excerpt || "توضیحات متا اینجا نمایش داده می‌شود."
  const host = siteConfig.url.replace(/^https?:\/\//, "")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="text-primary size-4" />
          سئو
        </CardTitle>
        <CardDescription>اگر خالی بمانند، عنوان و خلاصه مقاله استفاده می‌شوند.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="bg-background rounded-xl border p-4">
          <p className="text-muted-foreground mb-2 text-xs">پیش‌نمایش در گوگل</p>
          <p className="text-muted-foreground truncate text-xs" dir="ltr">
            {host} › blog › {form.slug || "..."}
          </p>
          <p className="mt-1 line-clamp-1 text-lg text-[#1a0dab] dark:text-[#8ab4f8]">{title}</p>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-6">{description}</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="meta-title">عنوان سئو (meta title)</Label>
          <Input id="meta-title" value={form.metaTitle} maxLength={70} onChange={(e) => set("metaTitle", e.target.value)} />
          <Counter value={form.metaTitle.length} max={70} ideal={[30, 60]} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="meta-description">توضیحات متا (meta description)</Label>
          <Textarea id="meta-description" rows={3} value={form.metaDescription} maxLength={170} onChange={(e) => set("metaDescription", e.target.value)} />
          <Counter value={form.metaDescription.length} max={170} ideal={[120, 160]} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="canonical">آدرس canonical (اختیاری)</Label>
          <Input
            id="canonical"
            dir="ltr"
            value={form.canonicalUrl}
            placeholder={`${siteConfig.url}/blog/${form.slug}`}
            onChange={(e) => set("canonicalUrl", e.target.value)}
          />
          <p className="text-muted-foreground text-xs">
            فقط وقتی پر کنید که نسخه اصلی این محتوا در آدرس دیگری است؛ در این صورت مقاله از نقشه سایت حذف می‌شود.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function CoverCard({ form, set }: { form: AdminPostInput; set: SetField }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ImagePlus className="text-primary size-4" />
          تصویر شاخص
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <ImagePicker value={form.coverImageUrl} onChange={(url) => set("coverImageUrl", url)} label="تصویر شاخص" />
        <div className="grid gap-2">
          <Label htmlFor="cover-alt">متن جایگزین (alt)</Label>
          <Input id="cover-alt" value={form.coverImageAlt} maxLength={200} onChange={(e) => set("coverImageAlt", e.target.value)} />
        </div>
      </CardContent>
    </Card>
  )
}

function CategoriesCard({
  categories,
  selected,
  onChange,
  onCreated,
}: {
  categories: AdminCategory[]
  selected: number[]
  onChange: (ids: number[]) => void
  onCreated: (category: AdminCategory) => void
}) {
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState("")
  const [pending, startTransition] = React.useTransition()

  const add = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    startTransition(async () => {
      const result = await saveCategory(null, { name: trimmed, slug: slugify(trimmed), description: "" })
      if (!result.ok) return setError(result.errors.join("، "))
      onCreated({ ...result.data, postCount: 0 })
      setName("")
      setError("")
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderTree className="text-primary size-4" />
          دسته‌بندی‌ها
        </CardTitle>
        <CardDescription>یک مقاله می‌تواند چند دسته‌بندی داشته باشد.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {categories.length ? (
          <ul className="grid max-h-56 gap-2 overflow-y-auto">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={selected.includes(category.id)}
                  onCheckedChange={(checked) =>
                    onChange(checked ? [...selected, category.id] : selected.filter((id) => id !== category.id))
                  }
                />
                <Label htmlFor={`cat-${category.id}`} className="font-normal">{category.name}</Label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-xs">هنوز دسته‌بندی‌ای ساخته نشده است.</p>
        )}
        <div className="flex gap-2 border-t pt-3">
          <Input
            value={name}
            placeholder="دسته‌بندی جدید"
            aria-label="نام دسته‌بندی جدید"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                add()
              }
            }}
          />
          <Button type="button" variant="outline" size="icon" disabled={pending || !name.trim()} onClick={add} aria-label="افزودن دسته‌بندی">
            <Plus />
          </Button>
        </div>
        {error && <p className="text-destructive text-xs">{error}</p>}
      </CardContent>
    </Card>
  )
}

function RelatedCard({
  options,
  selected,
  onChange,
}: {
  options: AdminPostOption[]
  selected: number[]
  onChange: (ids: number[]) => void
}) {
  const [query, setQuery] = React.useState("")
  const byId = new Map(options.map((o) => [o.id, o]))
  const matches = query.trim()
    ? options.filter((o) => !selected.includes(o.id) && o.title.includes(query.trim())).slice(0, 6)
    : []

  const move = (index: number, offset: number) => {
    const next = [...selected]
    const target = index + offset
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="text-primary size-4" />
          مقالات مرتبط
        </CardTitle>
        <CardDescription>
          به ترتیب انتخاب نمایش داده می‌شوند. اگر کمتر از ۳ مورد باشد، بقیه از همان دسته‌بندی‌ها پر می‌شود.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {selected.length > 0 && (
          <ol className="grid gap-2">
            {selected.map((id, i) => {
              const option = byId.get(id)
              return (
                <li key={id} className="flex items-center gap-1 rounded-md border p-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{option?.title ?? `مقاله #${fa(id)}`}</span>
                  {option?.status === "draft" && <Badge variant="secondary" className="text-[10px]">پیش‌نویس</Badge>}
                  <Button type="button" variant="ghost" size="icon" className="size-7" aria-label="انتقال به بالا" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="size-7" aria-label="انتقال به پایین" disabled={i === selected.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive size-7"
                    aria-label="حذف از مقالات مرتبط"
                    onClick={() => onChange(selected.filter((x) => x !== id))}
                  >
                    <Trash2 />
                  </Button>
                </li>
              )
            })}
          </ol>
        )}
        <div className="relative">
          <Input value={query} placeholder="جستجوی مقاله برای افزودن..." aria-label="جستجوی مقاله مرتبط" onChange={(e) => setQuery(e.target.value)} />
          {matches.length > 0 && (
            <ul className="bg-popover absolute inset-x-0 top-full z-10 mt-1 grid rounded-md border p-1 shadow-md">
              {matches.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    className="hover:bg-muted flex w-full items-center gap-2 rounded px-2 py-1.5 text-right text-sm"
                    onClick={() => {
                      onChange([...selected, option.id])
                      setQuery("")
                    }}
                  >
                    <Plus className="size-3.5 shrink-0" />
                    <span className="truncate">{option.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.trim() && matches.length === 0 && (
            <p className="text-muted-foreground mt-1 text-xs">مقاله‌ای پیدا نشد.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
