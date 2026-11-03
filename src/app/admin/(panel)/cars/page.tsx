import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Pencil, Plus, Search } from "lucide-react"

import { DeleteButton } from "@/components/admin/form-parts"
import { CarVisual } from "@/components/home/car-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminApi, type AdminBrandRow, type AdminCarRow } from "@/lib/admin-api"
import { calcInstallment, fa, million } from "@/lib/format"
import { cn } from "@/lib/utils"

import { deleteCar } from "../../catalog-actions"

export const metadata: Metadata = { title: "خودروها" }

type Props = PageProps<"/admin/cars">

export default function AdminCarsPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">خودروها</h1>
          <p className="text-muted-foreground mt-1 text-sm">خودروهای هر برند در صفحه همان برند و بخش پرمخاطب‌ها نمایش داده می‌شوند.</p>
        </div>
        <Button asChild>
          <Link href="/admin/cars/new">
            <Plus aria-hidden="true" />
            خودروی جدید
          </Link>
        </Button>
      </div>
      <Suspense fallback={<div className="bg-muted mt-8 h-64 animate-pulse rounded-xl" />}>
        <CarsTable searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function CarsTable({ searchParams }: Pick<Props, "searchParams">) {
  const params = await searchParams
  const brandId = Number(params.brand) || undefined
  const q = typeof params.q === "string" ? params.q.trim() : ""

  const query = new URLSearchParams()
  if (brandId) query.set("brandId", String(brandId))
  if (q) query.set("q", q)
  const [cars, brands] = await Promise.all([
    adminApi<AdminCarRow[]>(`/admin/cars?${query}`),
    adminApi<AdminBrandRow[]>("/admin/brands"),
  ])

  const href = (brand?: number) => {
    const p = new URLSearchParams()
    if (brand) p.set("brand", String(brand))
    if (q) p.set("q", q)
    const str = p.toString()
    return `/admin/cars${str ? `?${str}` : ""}`
  }

  return (
    <div className="bg-background mt-8 rounded-xl border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <nav aria-label="فیلتر برند" className="flex flex-wrap gap-1">
          {[{ id: undefined, name: "همه برندها" }, ...brands].map((brand) => (
            <Link
              key={brand.name}
              href={href(brand.id)}
              aria-current={brandId === brand.id ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                brandId === brand.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {brand.name}
              {"carCount" in brand && <span className="opacity-70"> ({fa(brand.carCount)})</span>}
            </Link>
          ))}
        </nav>
        <form action="/admin/cars" className="flex gap-2">
          {brandId && <input type="hidden" name="brand" value={brandId} />}
          <Input name="q" defaultValue={q} placeholder="جستجو در نام یا نامک" aria-label="جستجو" className="w-56" />
          <Button type="submit" variant="outline" size="icon" aria-label="جستجو">
            <Search />
          </Button>
        </form>
      </div>

      {cars.length === 0 ? (
        <p className="text-muted-foreground p-10 text-center text-sm">
          {q ? "خودرویی با این عبارت پیدا نشد." : "هنوز خودرویی ثبت نشده است."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>خودرو</TableHead>
              <TableHead>برند</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>قیمت (تومان)</TableHead>
              <TableHead>قسط ۳۶ ماهه</TableHead>
              <TableHead>بازدید هفته</TableHead>
              <TableHead>نمایش</TableHead>
              <TableHead className="w-24"><span className="sr-only">عملیات</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.id} className={car.isActive ? undefined : "opacity-60"}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted w-16 shrink-0 rounded-md px-1">
                      <CarVisual car={car} sizes="64px" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/cars/${car.id}`} className="hover:text-primary block font-medium">
                        {car.name}
                      </Link>
                      <span className="text-muted-foreground block text-xs">مدل {fa(car.year)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{car.brand.name}</TableCell>
                <TableCell>
                  <Badge variant={car.condition === "new" ? "default" : "secondary"}>
                    {car.condition === "new" ? "صفر" : "کارکرده"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{million(car.price)}</TableCell>
                <TableCell className="text-primary text-sm font-medium">
                  {million(calcInstallment(car.price, car.minDownPercent, 36).monthly)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{fa(car.weeklyViews)}</TableCell>
                <TableCell>
                  {car.isActive ? <Badge className="bg-emerald-600">فعال</Badge> : <Badge variant="secondary">غیرفعال</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/cars/${car.id}`} aria-label={`ویرایش ${car.name}`} title="ویرایش">
                        <Pencil />
                      </Link>
                    </Button>
                    <DeleteButton
                      label={`حذف ${car.name}`}
                      confirmText={`خودروی «${car.name}» برای همیشه حذف شود؟`}
                      action={deleteCar.bind(null, car.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
