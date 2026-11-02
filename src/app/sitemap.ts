import type { MetadataRoute } from "next"

import { absoluteUrl } from "@/lib/site"

// Add every new public page here
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ]
}
