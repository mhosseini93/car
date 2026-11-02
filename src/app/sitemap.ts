import type { MetadataRoute } from "next"

import { brands } from "@/components/home/data"
import { categoryPath, getBlogSitemap, postPath } from "@/lib/blog"
import { absoluteUrl } from "@/lib/site"

// Add every new public page here
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  // Blog URLs come from the backend; only indexable, self-canonical posts are listed
  const blog = await getBlogSitemap().catch(() => null)

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...brands.map((brand) => ({
      url: absoluteUrl(`/brands/${brand.slug}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    {
      url: absoluteUrl("/blog"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...(blog?.categories ?? []).map((category) => ({
      url: absoluteUrl(categoryPath(category.slug)),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...(blog?.posts ?? []).map((post) => ({
      url: absoluteUrl(postPath(post.slug)),
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
