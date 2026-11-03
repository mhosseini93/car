import { cacheLife, cacheTag } from "next/cache"

import { ApiError, api } from "@/lib/api"
import { CATALOG_TAG } from "@/lib/catalog-paths"

export { CATALOG_TAG, brandPath } from "@/lib/catalog-paths"

export type BrandRef = { id: number; slug: string; name: string }

export type Car = {
  id: number
  slug: string
  name: string
  year: number
  condition: "new" | "used"
  mileage: number
  // Cash price in toman
  price: number
  minDownPercent: number
  gearbox: string
  fuel: string
  color: string
  imageUrl: string | null
  imageAlt: string
  tags: string[]
  weeklyViews: number
  brand: BrandRef
}

export type BrandSummary = {
  id: number
  slug: string
  name: string
  englishName: string
  intro: string
  logoUrl: string | null
  color: string
  carCount: number
}

export type BrandFaq = { q: string; a: string }

export type Brand = Omit<BrandSummary, "carCount"> & {
  content: string
  faqs: BrandFaq[]
  metaTitle: string
  metaDescription: string
  robotsIndex: boolean
  robotsFollow: boolean
  createdAt: string
  updatedAt: string
  cars: Car[]
}

// All catalog reads share one tag; admin changes expire it with updateTag
async function cached<T>(path: string): Promise<T | null> {
  "use cache"
  cacheTag(CATALOG_TAG)
  cacheLife("hours")

  try {
    return await api<T>(path)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

// Listings degrade to empty when the backend is unreachable so pages still render
export const getBrands = () => cached<BrandSummary[]>("/catalog/brands").catch(() => null)

export const getBrand = (slug: string) => cached<Brand>(`/catalog/brands/${encodeURIComponent(slug)}`)

export const getPopularCars = () => cached<Car[]>("/catalog/cars/popular").catch(() => null)

export const getCatalogSitemap = () => cached<{ slug: string; updatedAt: string }[]>("/catalog/sitemap")
