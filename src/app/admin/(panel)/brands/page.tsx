import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ExternalLink, Pencil, Plus } from "lucide-react"

import { BrandMark } from "@/components/home/brand-grid"
import { DeleteButton } from "@/components/admin/form-parts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminApi, type AdminBrandRow } from "@/lib/admin-api"
import { brandPath } from "@/lib/catalog-paths"
import { fa, faDate } from "@/lib/format"

import { deleteBrand } from "../../catalog-actions"

export const metadata: Metadata = { title: "برندها" }

export default function AdminBrandsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">برندها</h1>
          <p className="text-muted-foreground mt-1 text-sm">صفحه هر برند در سایت، لیست خودروهای آن برند را نشان می‌دهد.</p>
        </div>
        <Button asChild>
          <Link href="/admin/brands/new">
            <Plus aria-hidden="true" />
            برند جدید
          </Link>
        </Button>
      </div>
      <Suspense fallback={<div className="bg-muted mt-8 h-64 animate-pulse rounded-xl" />}>
        <BrandsTable />
      </Suspense>
    </div>
  )
}

async function BrandsTable() {
  const brands = await adminApi<AdminBrandRow[]>("/admin/brands")

  if (!brands.length) {
    return (
      <p className="text-muted-foreground bg-background mt-8 rounded-xl border p-10 text-center text-sm">
        هنوز برندی ثبت نشده است.
      </p>
    )
  }

  return (
    <div className="bg-background mt-8 rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>برند</TableHead>
            <TableHead>خودروها</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>ربات‌ها</TableHead>
            <TableHead>ترتیب</TableHead>
            <TableHead>آخرین ویرایش</TableHead>
            <TableHead className="w-28"><span className="sr-only">عملیات</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <BrandMark brand={brand} className="size-9 rounded-lg text-sm" />
                  <div className="min-w-0">
                    <Link href={`/admin/brands/${brand.id}`} className="hover:text-primary block font-medium">
                      {brand.name}
                    </Link>
                    <span className="text-muted-foreground block text-xs" dir="ltr">/brands/{brand.slug}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Link href={`/admin/cars?brand=${brand.id}`} className="text-sm hover:underline">
                  {fa(brand.activeCarCount)} فعال
                  {brand.carCount > brand.activeCarCount && (
                    <span className="text-muted-foreground"> از {fa(brand.carCount)}</span>
                  )}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {brand.isActive ? (
                    <Badge className="bg-emerald-600">فعال</Badge>
                  ) : (
                    <Badge variant="secondary">غیرفعال</Badge>
                  )}
                  {brand.showOnHome && <Badge variant="outline">صفحه اصلی</Badge>}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Badge variant={brand.robotsIndex ? "outline" : "destructive"} className="font-mono" dir="ltr">
                    {brand.robotsIndex ? "index" : "noindex"}
                  </Badge>
                  <Badge variant={brand.robotsFollow ? "outline" : "destructive"} className="font-mono" dir="ltr">
                    {brand.robotsFollow ? "follow" : "nofollow"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{fa(brand.position)}</TableCell>
              <TableCell className="text-muted-foreground text-xs">{faDate(brand.updatedAt)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/brands/${brand.id}`} aria-label={`ویرایش ${brand.name}`} title="ویرایش">
                      <Pencil />
                    </Link>
                  </Button>
                  {brand.isActive && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={brandPath(brand.slug)} target="_blank" aria-label={`مشاهده صفحه ${brand.name}`} title="مشاهده">
                        <ExternalLink />
                      </Link>
                    </Button>
                  )}
                  <DeleteButton
                    label={`حذف ${brand.name}`}
                    confirmText={`برند «${brand.name}» حذف شود؟`}
                    action={deleteBrand.bind(null, brand.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
