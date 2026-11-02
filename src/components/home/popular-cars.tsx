import Link from "next/link"
import { Eye, Flame } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { calcInstallment, fa, million } from "@/lib/format"

import { CarIllustration } from "./car-illustration"
import { getBrand, popularCars } from "./data"

export function PopularCars() {
  return (
    <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {popularCars.map((car, i) => {
        const brand = getBrand(car.brand)
        const { monthly } = calcInstallment(car.price, car.minDownPercent, 36)

        return (
          <li key={car.id}>
            <article
              aria-labelledby={`popular-${car.id}`}
              className="bg-card relative flex h-full flex-col overflow-hidden rounded-2xl border transition-shadow hover:shadow-lg"
            >
              <div className="from-primary/10 relative bg-linear-to-b to-transparent px-5 pt-9 pb-2">
                <span className="bg-primary text-primary-foreground absolute top-3 right-3 grid size-8 place-items-center rounded-full text-sm font-black">
                  <span className="sr-only">رتبه </span>
                  {fa(i + 1)}
                </span>
                {i === 0 && (
                  <Badge className="absolute top-3 left-3 gap-1 bg-orange-500 text-white">
                    <Flame aria-hidden="true" />
                    داغ‌ترین
                  </Badge>
                )}
                <CarIllustration color={car.color} label={`تصویر ${car.name}`} className="w-full" />
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5 pt-3">
                <div>
                  {brand && (
                    <Link
                      href={`/brands/${brand.slug}`}
                      className="text-muted-foreground hover:text-primary text-xs"
                    >
                      {brand.name}
                    </Link>
                  )}
                  <h3 id={`popular-${car.id}`} className="font-bold">
                    {car.name}
                  </h3>
                </div>
                <p className="text-sm">
                  قسط ماهانه از{" "}
                  <span className="text-primary font-bold">{million(monthly)} تومان</span>
                </p>
                <p className="text-muted-foreground mt-auto flex items-center gap-1.5 border-t pt-3 text-xs">
                  <Eye className="size-3.5" aria-hidden="true" />
                  {fa(car.weeklyViews)} بازدید در هفته گذشته
                </p>
              </div>
            </article>
          </li>
        )
      })}
    </ol>
  )
}
