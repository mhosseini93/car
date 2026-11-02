import Image from "next/image"
import Link from "next/link"
import { CalendarDays, Clock, Newspaper } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { categoryPath, postPath, type PostSummary } from "@/lib/blog"
import { fa, faDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export function PostCover({
  post,
  className,
  priority,
  sizes,
}: {
  post: Pick<PostSummary, "coverImageUrl" | "coverImageAlt" | "title">
  className?: string
  priority?: boolean
  sizes: string
}) {
  return (
    <div className={cn("bg-muted relative aspect-video overflow-hidden", className)}>
      {post.coverImageUrl ? (
        <Image
          src={post.coverImageUrl}
          alt={post.coverImageAlt || post.title}
          fill
          sizes={sizes}
          priority={priority}
          // External URLs aren't in images.remotePatterns, so serve them as-is
          unoptimized={!post.coverImageUrl.startsWith("/")}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          aria-hidden="true"
          className="from-primary/15 to-primary/5 text-primary/40 grid size-full place-items-center bg-linear-to-br"
        >
          <Newspaper className="size-12" />
        </div>
      )}
    </div>
  )
}

export function PostMeta({ post, className }: { post: PostSummary; className?: string }) {
  return (
    <div className={cn("text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs", className)}>
      <span className="flex items-center gap-1">
        <CalendarDays className="size-3.5" aria-hidden="true" />
        <time dateTime={post.publishedAt}>{faDate(post.publishedAt)}</time>
      </span>
      <span className="flex items-center gap-1">
        <Clock className="size-3.5" aria-hidden="true" />
        {fa(post.readingMinutes)} دقیقه مطالعه
      </span>
    </div>
  )
}

export function PostCategories({ post }: { post: PostSummary }) {
  if (!post.categories.length) return null
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="دسته‌بندی‌ها">
      {post.categories.map((category) => (
        <li key={category.id}>
          <Badge variant="secondary" asChild>
            <Link href={categoryPath(category.slug)} className="relative z-10">
              {category.name}
            </Link>
          </Badge>
        </li>
      ))}
    </ul>
  )
}

export function PostCard({
  post,
  featured,
  headingLevel: Heading = "h2",
}: {
  post: PostSummary
  featured?: boolean
  headingLevel?: "h2" | "h3"
}) {
  return (
    <article
      className={cn(
        "group bg-card relative flex flex-col overflow-hidden rounded-2xl border transition-shadow hover:shadow-lg",
        featured && "md:grid md:grid-cols-2"
      )}
    >
      <PostCover
        post={post}
        priority={featured}
        sizes={featured ? "(min-width: 768px) 576px, 100vw" : "(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"}
        className={featured ? "md:aspect-auto md:h-full" : undefined}
      />
      <div className={cn("flex flex-1 flex-col gap-3 p-5", featured && "md:justify-center md:p-8")}>
        <PostCategories post={post} />
        <Heading className={cn("font-bold leading-8", featured ? "text-2xl md:text-3xl md:leading-snug" : "text-lg")}>
          {/* Stretched link: the whole card is clickable */}
          <Link href={postPath(post.slug)} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </Heading>
        {post.excerpt && (
          <p className={cn("text-muted-foreground leading-7", featured ? "line-clamp-4" : "line-clamp-3 text-sm")}>
            {post.excerpt}
          </p>
        )}
        <PostMeta post={post} className="mt-auto pt-2" />
      </div>
    </article>
  )
}
