import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { ApiError, api } from "@/lib/api"

// Backend call as the signed-in admin; an expired session goes back to login
export async function adminApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!token) redirect("/admin/login")

  try {
    return await api<T>(path, { cache: "no-store", ...init, token })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/admin/login")
    throw error
  }
}

export type AdminPost = {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  coverImageUrl: string | null
  coverImageAlt: string
  status: "draft" | "published"
  publishedAt: string | null
  readingMinutes: number
  metaTitle: string
  metaDescription: string
  canonicalUrl: string
  robotsIndex: boolean
  robotsFollow: boolean
  allowComments: boolean
  createdAt: string
  updatedAt: string
  categoryIds: number[]
  relatedIds: number[]
}

export type AdminPostInput = Omit<AdminPost, "id" | "readingMinutes" | "createdAt" | "updatedAt">

export type AdminPostRow = {
  id: number
  slug: string
  title: string
  status: "draft" | "published"
  publishedAt: string | null
  updatedAt: string
  robotsIndex: boolean
  robotsFollow: boolean
  commentCount: number
  pendingComments: number
  categories: { id: number; slug: string; name: string }[]
}

export type AdminCategory = { id: number; slug: string; name: string; description: string; postCount: number }

export type AdminPostOption = { id: number; title: string; slug: string; status: "draft" | "published" }

export type AdminComment = {
  id: number
  authorName: string
  authorEmail: string
  content: string
  status: "pending" | "approved" | "spam"
  createdAt: string
  post: { id: number; title: string; slug: string }
}

export type Paged<T, C> = { items: T[]; counts: C; page: number; totalPages: number; total: number }

export type AdminBrand = {
  id: number
  slug: string
  name: string
  englishName: string
  intro: string
  content: string
  logoUrl: string | null
  color: string
  faqs: { q: string; a: string }[]
  metaTitle: string
  metaDescription: string
  robotsIndex: boolean
  robotsFollow: boolean
  isActive: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export type AdminBrandInput = Omit<AdminBrand, "id" | "createdAt" | "updatedAt">

export type AdminBrandRow = Pick<
  AdminBrand,
  "id" | "slug" | "name" | "logoUrl" | "color" | "isActive" | "robotsIndex" | "robotsFollow" | "position" | "updatedAt"
> & { carCount: number; activeCarCount: number }

export type AdminCar = {
  id: number
  slug: string
  brandId: number
  name: string
  year: number
  condition: "new" | "used"
  mileage: number
  price: number
  minDownPercent: number
  gearbox: string
  fuel: string
  color: string
  imageUrl: string | null
  imageAlt: string
  tags: string[]
  weeklyViews: number
  isActive: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export type AdminCarInput = Omit<AdminCar, "id" | "createdAt" | "updatedAt">

export type AdminCarRow = Omit<AdminCar, "brandId" | "createdAt"> & {
  brand: { id: number; slug: string; name: string }
}
