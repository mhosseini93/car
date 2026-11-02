import type { Metadata } from "next"
import { Suspense } from "react"

import { CategoryNav, ListSkeleton, Pagination, PostGrid } from "@/components/blog/post-list"
import { JsonLd } from "@/components/seo/json-ld"
import { breadcrumbSchema } from "@/components/home/structured-data"
import { getCategories, getPosts, parsePage } from "@/lib/blog"
import { fa } from "@/lib/format"
import { absoluteUrl, baseOpenGraph, siteConfig, socialImage } from "@/lib/site"

const TITLE = "بلاگ خرید اقساطی خودرو"
const DESCRIPTION =
  "راهنمای خرید اقساطی خودرو، مقایسه شرایط اقساط، نکات خرید خودروی صفر و کارکرده و اخبار بازار خودرو."

export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const page = parsePage((await searchParams).page)
  const path = page > 1 ? `/blog?page=${page}` : "/blog"
  const title = page > 1 ? `${TITLE} - صفحه ${fa(page)}` : TITLE

  return {
    title,
    description: DESCRIPTION,
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph, title, description: DESCRIPTION, url: path, images: [socialImage] },
    twitter: { card: "summary_large_image", title, description: DESCRIPTION, images: [socialImage] },
  }
}

export default function BlogPage({ searchParams }: PageProps<"/blog">) {
  return (
    <main id="main" className="flex-1">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Blog",
              name: TITLE,
              description: DESCRIPTION,
              url: absoluteUrl("/blog"),
              inLanguage: "fa-IR",
              publisher: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
            },
            breadcrumbSchema([
              { name: "خانه", path: "/" },
              { name: "بلاگ", path: "/blog" },
            ]),
          ],
        }}
      />

      <section className="bg-muted/50 border-b">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-black sm:text-4xl">{TITLE}</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-7">{DESCRIPTION}</p>
          <div className="mt-6">
            <Suspense fallback={null}>
              <Categories />
            </Suspense>
          </div>
        </div>
      </section>

      <section aria-label="مقالات" className="mx-auto max-w-6xl px-4 py-12">
        <Suspense fallback={<ListSkeleton />}>
          <Posts searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  )
}

async function Categories() {
  const categories = await getCategories()
  return <CategoryNav categories={categories ?? []} />
}

async function Posts({ searchParams }: { searchParams: PageProps<"/blog">["searchParams"] }) {
  const page = parsePage((await searchParams).page)
  const data = await getPosts(page)
  if (!data) return null

  return (
    <>
      <PostGrid data={data} featureFirst />
      <Pagination basePath="/blog" page={data.page} totalPages={data.totalPages} />
    </>
  )
}
