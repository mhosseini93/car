import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ChevronLeft, List, MessageCircle, UserRound } from "lucide-react"

import { CommentForm } from "@/components/blog/comment-form"
import { PostCard, PostCategories, PostCover, PostMeta } from "@/components/blog/post-card"
import { breadcrumbSchema, orgId } from "@/components/home/structured-data"
import { JsonLd } from "@/components/seo/json-ld"
import { decodeSlug, getPost, postPath, type Post } from "@/lib/blog"
import { withHeadingAnchors, type TocItem } from "@/lib/blog-content"
import { fa, faDate } from "@/lib/format"
import { absoluteUrl, baseOpenGraph, siteConfig, socialImage } from "@/lib/site"

type Props = PageProps<"/blog/[slug]">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(decodeSlug((await params).slug))
  if (!post) return { title: "مقاله پیدا نشد", robots: { index: false } }

  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt
  const path = postPath(post.slug)
  const image = post.coverImageUrl
    ? { url: post.coverImageUrl, alt: post.coverImageAlt || post.title }
    : socialImage
  const robots = { index: post.robotsIndex, follow: post.robotsFollow }

  return {
    // Meta titles are written in full, so skip the "| site name" template
    title: post.metaTitle ? { absolute: post.metaTitle } : post.title,
    description,
    alternates: { canonical: post.canonicalUrl || path },
    robots: { ...robots, googleBot: { ...robots, "max-image-preview": "large" } },
    openGraph: {
      ...baseOpenGraph,
      type: "article",
      title,
      description,
      url: path,
      images: [image],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      section: post.categories[0]?.name,
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  }
}

export default function PostPage({ params }: Props) {
  return (
    <main id="main" className="flex-1">
      <Suspense fallback={<ArticleSkeleton />}>
        <Article params={params} />
      </Suspense>
    </main>
  )
}

async function Article({ params }: Pick<Props, "params">) {
  const post = await getPost(decodeSlug((await params).slug))
  if (!post) notFound()

  const { html, toc } = withHeadingAnchors(post.content)
  const updated = new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 86_400_000

  return (
    <>
      <ArticleJsonLd post={post} />

      <article>
        <header className="mx-auto max-w-3xl px-4 pt-10">
          <nav aria-label="مسیر صفحه">
            <ol className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
              <li><Link href="/" className="hover:text-foreground">خانه</Link></li>
              <li aria-hidden="true"><ChevronLeft className="size-4" /></li>
              <li><Link href="/blog" className="hover:text-foreground">بلاگ</Link></li>
              <li aria-hidden="true"><ChevronLeft className="size-4" /></li>
              <li aria-current="page" className="text-foreground line-clamp-1 font-medium">{post.title}</li>
            </ol>
          </nav>

          <div className="mt-6"><PostCategories post={post} /></div>
          <h1 className="mt-4 text-3xl leading-tight font-black sm:text-4xl sm:leading-tight">{post.title}</h1>
          {post.excerpt && <p className="text-muted-foreground mt-4 text-lg leading-8">{post.excerpt}</p>}

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y py-3">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <UserRound className="text-primary size-4" aria-hidden="true" />
              تحریریه {siteConfig.name}
            </span>
            <PostMeta post={post} />
            {updated && (
              <span className="text-muted-foreground text-xs">
                به‌روزرسانی: <time dateTime={post.updatedAt}>{faDate(post.updatedAt)}</time>
              </span>
            )}
            {post.comments.length > 0 && (
              <a href="#comments" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
                <MessageCircle className="size-3.5" aria-hidden="true" />
                {fa(post.comments.length)} دیدگاه
              </a>
            )}
          </div>
        </header>

        {post.coverImageUrl && (
          <div className="mx-auto mt-8 max-w-4xl px-4">
            <PostCover post={post} priority sizes="(min-width: 896px) 864px, 100vw" className="rounded-2xl" />
          </div>
        )}

        <div className="mx-auto mt-10 grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_16rem]">
          <div className="min-w-0 lg:order-1">
            <div className="mx-auto max-w-3xl">
              {toc.length >= 3 && <TableOfContents toc={toc} className="mb-8 lg:hidden" />}
              <div
                className="prose prose-lg prose-neutral dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-extrabold prose-a:text-primary prose-img:rounded-xl max-w-none leading-9"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
          {toc.length >= 3 && (
            <aside className="hidden lg:order-2 lg:block">
              <TableOfContents toc={toc} className="sticky top-24" />
            </aside>
          )}
        </div>
      </article>

      {post.related.length > 0 && (
        <section aria-labelledby="related-heading" className="bg-muted/50 mt-16 border-y">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 id="related-heading" className="text-2xl font-extrabold">مقالات مرتبط</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {post.related.map((related) => (
                <PostCard key={related.id} post={related} headingLevel="h3" />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="comments" aria-labelledby="comments-heading" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-14">
        <h2 id="comments-heading" className="text-2xl font-extrabold">
          دیدگاه‌ها {post.comments.length > 0 && <span className="text-muted-foreground">({fa(post.comments.length)})</span>}
        </h2>
        {post.comments.length > 0 ? (
          <ol className="mt-6 grid gap-4">
            {post.comments.map((comment) => (
              <li key={comment.id} className="bg-card rounded-2xl border p-5">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="bg-primary/10 text-primary grid size-9 place-items-center rounded-full font-bold">
                    {comment.authorName.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{comment.authorName}</p>
                    <time dateTime={comment.createdAt} className="text-muted-foreground text-xs">{faDate(comment.createdAt)}</time>
                  </div>
                </div>
                <p className="mt-3 leading-8 whitespace-pre-line">{comment.content}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">هنوز دیدگاهی ثبت نشده است.</p>
        )}
        <div className="mt-8">
          {post.allowComments ? (
            <CommentForm slug={post.slug} />
          ) : (
            <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">ارسال دیدگاه برای این مقاله بسته شده است.</p>
          )}
        </div>
      </section>
    </>
  )
}

function TableOfContents({ toc, className }: { toc: TocItem[]; className?: string }) {
  return (
    <nav aria-labelledby="toc-heading" className={`bg-card rounded-2xl border p-5 ${className ?? ""}`}>
      <p id="toc-heading" className="flex items-center gap-2 font-bold">
        <List className="text-primary size-4" aria-hidden="true" />
        فهرست مطالب
      </p>
      <ol className="mt-3 grid gap-2 text-sm">
        {toc.map((item) => (
          <li key={item.id} className={item.level === 3 ? "ps-4" : undefined}>
            <a href={`#${item.id}`} className="text-muted-foreground hover:text-primary leading-6">
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function ArticleJsonLd({ post }: { post: Post }) {
  const url = absoluteUrl(postPath(post.slug))
  const image = post.coverImageUrl
    ? post.coverImageUrl.startsWith("/") ? absoluteUrl(post.coverImageUrl) : post.coverImageUrl
    : absoluteUrl("/opengraph-image")

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",
            "@id": `${url}#article`,
            headline: post.title,
            description: post.metaDescription || post.excerpt,
            image,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            inLanguage: "fa-IR",
            mainEntityOfPage: url,
            author: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
            publisher: { "@id": orgId },
            articleSection: post.categories.map((c) => c.name),
            commentCount: post.comments.length,
          },
          breadcrumbSchema([
            { name: "خانه", path: "/" },
            { name: "بلاگ", path: "/blog" },
            { name: post.title, path: postPath(post.slug) },
          ]),
        ],
      }}
    />
  )
}

function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-4 py-10">
      <div className="bg-muted h-4 w-48 rounded" />
      <div className="bg-muted mt-8 h-10 rounded" />
      <div className="bg-muted mt-3 h-10 w-2/3 rounded" />
      <div className="bg-muted mt-8 aspect-video rounded-2xl" />
      <div className="mt-8 grid gap-3">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="bg-muted h-4 rounded" />)}
      </div>
    </div>
  )
}
