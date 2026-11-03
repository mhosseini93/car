"use client"

import * as React from "react"
import { CarFront } from "lucide-react"

import { CarCard } from "@/components/home/car-card"
import type { Car } from "@/lib/catalog"
import { fa, lowestInstallment } from "@/lib/format"
import { cn } from "@/lib/utils"

type Condition = "all" | Car["condition"]
type Sort = "default" | "popular" | "cheap" | "expensive" | "monthly"

const sorts: { value: Sort; label: string }[] = [
  { value: "default", label: "پیشنهاد ما" },
  { value: "popular", label: "پربازدیدترین" },
  { value: "cheap", label: "ارزان‌ترین" },
  { value: "expensive", label: "گران‌ترین" },
  { value: "monthly", label: "کمترین قسط ماهانه" },
]

const monthly = (car: Car) => lowestInstallment(car).monthly

const compare: Record<Exclude<Sort, "default">, (a: Car, b: Car) => number> = {
  popular: (a, b) => b.weeklyViews - a.weeklyViews,
  cheap: (a, b) => a.price - b.price,
  expensive: (a, b) => b.price - a.price,
  monthly: (a, b) => monthly(a) - monthly(b),
}

// Filters only re-order/hide cards that are already in the server HTML, so every
// car stays crawlable and the URL keeps a single canonical version
export function BrandCars({ cars, brandName }: { cars: Car[]; brandName: string }) {
  const [condition, setCondition] = React.useState<Condition>("all")
  const [sort, setSort] = React.useState<Sort>("default")

  const counts = {
    all: cars.length,
    new: cars.filter((c) => c.condition === "new").length,
    used: cars.filter((c) => c.condition === "used").length,
  }
  const filtered = cars.filter((c) => condition === "all" || c.condition === condition)
  const list = sort === "default" ? filtered : [...filtered].sort(compare[sort])

  const tabs: { value: Condition; label: string }[] = [
    { value: "all", label: "همه" },
    { value: "new", label: "صفر کیلومتر" },
    { value: "used", label: "کارکرده" },
  ]

  if (!cars.length) {
    return (
      <div className="text-muted-foreground mt-8 grid place-items-center gap-3 rounded-2xl border border-dashed p-12 text-center">
        <CarFront className="size-10 opacity-40" aria-hidden="true" />
        <p>در حال حاضر خودرویی از {brandName} برای فروش اقساطی موجود نیست.</p>
      </div>
    )
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="فیلتر وضعیت خودرو" className="bg-muted flex gap-1 rounded-lg p-1">
          {tabs
            .filter((tab) => tab.value === "all" || counts[tab.value] > 0)
            .map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={condition === tab.value}
                onClick={() => setCondition(tab.value)}
                className={cn(
                  "focus-visible:ring-ring/50 rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px]",
                  condition === tab.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label} <span className="opacity-60">({fa(counts[tab.value])})</span>
              </button>
            ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="brand-cars-sort" className="text-muted-foreground">
            مرتب‌سازی:
          </label>
          <select
            id="brand-cars-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="border-input bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]"
          >
            {sorts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {fa(list.length)} خودرو نمایش داده می‌شود
      </p>
      <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((car, i) => (
          <li key={car.id}>
            <CarCard car={car} priority={i === 0} />
          </li>
        ))}
      </ul>
    </>
  )
}
