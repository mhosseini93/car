import type { Metadata } from "next"
import { Suspense } from "react"

import { adminApi, type AdminCategory } from "@/lib/admin-api"

import { CategoriesManager } from "./categories-manager"

export const metadata: Metadata = { title: "دسته‌بندی‌ها" }

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold">دسته‌بندی‌ها</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        هر دسته‌بندی یک صفحه عمومی در <span dir="ltr">/blog/category/…</span> دارد.
      </p>
      <Suspense fallback={<div className="bg-muted mt-8 h-64 animate-pulse rounded-xl" />}>
        <Categories />
      </Suspense>
    </div>
  )
}

async function Categories() {
  const categories = await adminApi<AdminCategory[]>("/admin/categories")
  return <CategoriesManager initial={categories} />
}
