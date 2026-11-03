import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { adminApi, type AdminBrand, type AdminCarRow } from "@/lib/admin-api"
import { ApiError } from "@/lib/api"

import { EditorSkeleton } from "../../posts/editor-skeleton"
import { BrandEditor } from "../brand-editor"

export const metadata: Metadata = { title: "ویرایش برند" }

export default function EditBrandPage({ params }: PageProps<"/admin/brands/[id]">) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditBrand params={params} />
    </Suspense>
  )
}

async function EditBrand({ params }: { params: PageProps<"/admin/brands/[id]">["params"] }) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) notFound()

  const [brand, cars] = await Promise.all([
    adminApi<AdminBrand>(`/admin/brands/${id}`).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound()
      throw error
    }),
    adminApi<AdminCarRow[]>(`/admin/cars?brandId=${id}`),
  ])
  // key: remount the editor when switching between brands
  return <BrandEditor key={brand.id} brand={brand} carCount={cars.length} />
}
