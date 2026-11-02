import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ChevronLeft } from "lucide-react"

import { CategoryNav, ListSkeleton, Pagination, PostGrid } from "@/components/blog/post-list"
import { breadcrumbSchema } from "@/components/home/structured-data"
import { JsonLd } from "@/components/seo/json-ld"
import { categoryPath, decodeSlug, getCategories, getCategoryPosts, parsePage } from "@/lib/blog"
import { fa } from "@/lib/format"
import { baseOpenGraph, socialImage } from "@/lib/site"

type Props = PageProps<"/blog/category/[slug]">

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const slug = decodeSlug((await params).slug)
  const page = parsePage((await searchParams).page)
  const data = await getCategoryPosts(slug, page)
  if (!data?.category) return { title: "دسته‌بندی پیدا نشد", robots: { index: false } }

  const base = categoryPath(slug)
  const path = page > 1 ? `${base}?page=${page}` : base
  const title = `مقالات ${data.category.name}${page > 1 ? ` - صفحه ${fa(page)}` : ""}`
  const description =
    data.category.description || `همه مقالات بلاگ در دسته‌بندی «${data.category.name}».`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph, title, description, url: path, images: [socialImage] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  }
}

export default function CategoryPage({ params, searchParams }: Props) {
  return (
    <main id="main" className="flex-1">
      <Suspense fallback={<HeaderSkeleton />}>
        <CategoryContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function CategoryContent({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const slug = decodeSlug((await params).slug)
  const page = parsePage((await searchParams).page)
  const [data, categories] = await Promise.all([getCategoryPosts(slug, page), getCategories()])
  if (!data?.category) notFound()

  const { category } = data

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          ...breadcrumbSchema([
            { name: "خانه", path: "/" },
            { name: "بلاگ", path: "/blog" },
            { name: category.name, path: categoryPath(category.slug) },
          ]),
        }}
      />
      <section className="bg-muted/50 border-b">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <nav aria-label="مسیر صفحه">
            <ol className="text-muted-foreground flex items-center gap-1 text-sm">
              <li>
                <Link href="/" className="hover:text-foreground">خانه</Link>
              </li>
              <li aria-hidden="true"><ChevronLeft className="size-4" /></li>
              <li>
                <Link href="/blog" className="hover:text-foreground">بلاگ</Link>
              </li>
              <li aria-hidden="true"><ChevronLeft className="size-4" /></li>
              <li aria-current="page" className="text-foreground font-medium">{category.name}</li>
            </ol>
          </nav>
          <h1 className="mt-6 text-3xl font-black sm:text-4xl">مقالات {category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-3 max-w-2xl leading-7">{category.description}</p>
          )}
          <div className="mt-6">
            <CategoryNav categories={categories ?? []} activeSlug={category.slug} />
          </div>
        </div>
      </section>

      <section aria-label="مقالات" className="mx-auto max-w-6xl px-4 py-12">
        <PostGrid data={data} />
        <Pagination basePath={categoryPath(category.slug)} page={data.page} totalPages={data.totalPages} />
      </section>
    </>
  )
}

function HeaderSkeleton() {
  return (
    <>
      <div className="bg-muted/50 border-b">
        <div className="mx-auto max-w-6xl animate-pulse px-4 py-12">
          <div className="bg-muted h-4 w-40 rounded" />
          <div className="bg-muted mt-6 h-10 w-72 rounded" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ListSkeleton />
      </div>
    </>
  )
}
