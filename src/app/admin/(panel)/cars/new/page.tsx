import type { Metadata } from "next"
import { Suspense } from "react"

import { adminApi, type AdminBrandRow } from "@/lib/admin-api"

import { EditorSkeleton } from "../../posts/editor-skeleton"
import { CarEditor } from "../car-editor"

export const metadata: Metadata = { title: "خودروی جدید" }

type Props = PageProps<"/admin/cars/new">

export default function NewCarPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <NewCar searchParams={searchParams} />
    </Suspense>
  )
}

async function NewCar({ searchParams }: Pick<Props, "searchParams">) {
  const [{ brand }, brands] = await Promise.all([searchParams, adminApi<AdminBrandRow[]>("/admin/brands")])
  return <CarEditor car={null} brands={brands} defaultBrandId={Number(brand) || undefined} />
}
