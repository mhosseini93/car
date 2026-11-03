import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { adminApi, type AdminBrandRow, type AdminCar } from "@/lib/admin-api"
import { ApiError } from "@/lib/api"

import { EditorSkeleton } from "../../posts/editor-skeleton"
import { CarEditor } from "../car-editor"

export const metadata: Metadata = { title: "ویرایش خودرو" }

export default function EditCarPage({ params }: PageProps<"/admin/cars/[id]">) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditCar params={params} />
    </Suspense>
  )
}

async function EditCar({ params }: { params: PageProps<"/admin/cars/[id]">["params"] }) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) notFound()

  const [car, brands] = await Promise.all([
    adminApi<AdminCar>(`/admin/cars/${id}`).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound()
      throw error
    }),
    adminApi<AdminBrandRow[]>("/admin/brands"),
  ])
  // key: remount the editor when switching between cars
  return <CarEditor key={car.id} car={car} brands={brands} />
}
