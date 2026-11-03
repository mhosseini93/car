import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PostCard } from "@/components/blog/post-card"
import { Button } from "@/components/ui/button"
import { getPosts } from "@/lib/blog"

const COUNT = 3

// Server-rendered from the cached blog feed (tag "blog"), so publishing a post
// refreshes the homepage too. Renders nothing if there are no posts or the API is down.
export async function LatestPosts() {
  const posts = await getPosts(1)
    .then((data) => data?.items.slice(0, COUNT) ?? [])
    .catch(() => [])
  if (!posts.length) return null

  return (
    <section aria-labelledby="blog-heading" className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="blog-heading" className="text-2xl font-extrabold sm:text-3xl">
              آخرین مقالات بلاگ
            </h2>
            <p className="text-muted-foreground mt-2">
              راهنما و نکات کاربردی برای خرید اقساطی خودرو
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/blog">
              همه مقالات
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} headingLevel="h3" />
          ))}
        </div>
      </div>
    </section>
  )
}
