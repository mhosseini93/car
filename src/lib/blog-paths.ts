// Client-safe blog helpers (no server caching APIs)
export const BLOG_TAG = "blog"

export const postPath = (slug: string) => `/blog/${encodeURIComponent(slug)}`
export const categoryPath = (slug: string) => `/blog/category/${encodeURIComponent(slug)}`
