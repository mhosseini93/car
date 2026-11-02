import { cacheLife, cacheTag } from "next/cache"

import { ApiError, api } from "@/lib/api"

import { BLOG_TAG } from "@/lib/blog-paths"

export { BLOG_TAG, categoryPath, postPath } from "@/lib/blog-paths"

export type BlogCategory = { id: number; slug: string; name: string }

export type PostSummary = {
  id: number
  slug: string
  title: string
  excerpt: string
  coverImageUrl: string | null
  coverImageAlt: string
  publishedAt: string
  readingMinutes: number
  categories: BlogCategory[]
}

export type PostComment = { id: number; authorName: string; content: string; createdAt: string }

export type Post = PostSummary & {
  content: string
  metaTitle: string
  metaDescription: string
  canonicalUrl: string
  robotsIndex: boolean
  robotsFollow: boolean
  allowComments: boolean
  updatedAt: string
  related: PostSummary[]
  comments: PostComment[]
}

export type PostPage = {
  items: PostSummary[]
  page: number
  totalPages: number
  total: number
  category: (BlogCategory & { description: string }) | null
}

export type CategoryWithCount = BlogCategory & { description: string; postCount: number }

// Route params arrive percent-encoded for Persian slugs
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}


// All blog reads share one tag; admin changes expire it with updateTag
async function cached<T>(path: string): Promise<T | null> {
  "use cache"
  cacheTag(BLOG_TAG)
  cacheLife("hours")

  try {
    return await api<T>(path)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export const getPosts = (page = 1) => cached<PostPage>(`/blog/posts?page=${page}`)

export const getPost = (slug: string) => cached<Post>(`/blog/posts/${encodeURIComponent(slug)}`)

export const getCategoryPosts = (slug: string, page = 1) =>
  cached<PostPage>(`/blog/categories/${encodeURIComponent(slug)}?page=${page}`)

export const getCategories = () => cached<CategoryWithCount[]>("/blog/categories")

export const getBlogSitemap = () =>
  cached<{ posts: { slug: string; updatedAt: string }[]; categories: { slug: string }[] }>(
    "/blog/sitemap"
  )

export function parsePage(value: string | string[] | undefined): number {
  const page = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(page) && page > 0 ? page : 1
}
