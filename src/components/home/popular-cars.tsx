import Link from "next/link"
import { CalendarDays, Flame } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { brandPath, carPath, type Car } from "@/lib/catalog"
import { fa, faYear, lowestInstallment, million } from "@/lib/format"

import { CarVisual } from "./car-card"

export function PopularCars({ cars }: { cars: Car[] }) {
  return (
    <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cars.map((car, i) => {
        const { monthly } = lowestInstallment(car)

        return (
          <li key={car.id}>
            <article
              aria-labelledby={`popular-${car.slug}`}
              className="bg-card relative flex h-full flex-col overflow-hidden rounded-2xl border transition-shadow hover:shadow-lg"
            >
              <div className="from-primary/10 relative bg-linear-to-b to-transparent px-5 pt-9 pb-2">
                <span className="bg-primary text-primary-foreground absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full text-sm font-black">
                  <span className="sr-only">رتبه </span>
                  {fa(i + 1)}
                </span>
                {i === 0 && (
                  <Badge className="absolute top-3 left-3 z-10 gap-1 bg-orange-500 text-white">
                    <Flame aria-hidden="true" />
                    داغ‌ترین
                  </Badge>
                )}
                <CarVisual car={car} sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 90vw" />
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5 pt-3">
                <div>
                  <Link
                    href={brandPath(car.brand.slug)}
                    className="text-muted-foreground hover:text-primary relative z-10 text-xs"
                  >
                    {car.brand.name}
                  </Link>
                  <h3 id={`popular-${car.slug}`} className="font-bold">
                    {/* Stretched over the whole card */}
                    <Link
                      href={carPath(car.slug)}
                      className="hover:text-primary outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
                    >
                      {car.name}
                    </Link>
                  </h3>
                </div>
                <p className="text-sm">
                  قسط ماهانه از{" "}
                  <span className="text-primary font-bold">{million(monthly)} تومان</span>
                </p>
                <p className="text-muted-foreground mt-auto flex items-center gap-1.5 border-t pt-3 text-xs">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  مدل {faYear(car.year)} · {car.gearbox} · {car.condition === "new" ? "صفر کیلومتر" : "کارکرده"}
                </p>
              </div>
            </article>
          </li>
        )
      })}
    </ol>
  )
}
