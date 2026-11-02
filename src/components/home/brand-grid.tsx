import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { fa } from "@/lib/format"
import { cn } from "@/lib/utils"

import { brands, getBrandCars, type Brand } from "./data"

// Monogram stand-in until real brand logos are added
export function BrandMark({ brand, className }: { brand: Brand; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: brand.color }}
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-xl text-lg font-black text-white",
        className
      )}
    >
      {brand.name.charAt(0)}
    </span>
  )
}

export function BrandGrid({ excludeSlug }: { excludeSlug?: string }) {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {brands
        .filter((brand) => brand.slug !== excludeSlug)
        .map((brand) => (
          <li key={brand.slug}>
            <Link
              href={`/brands/${brand.slug}`}
              className="group bg-card hover:border-primary/40 focus-visible:ring-ring/50 flex h-full flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px]"
            >
              <BrandMark brand={brand} />
              <span className="font-bold">{brand.name}</span>
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                {fa(getBrandCars(brand.slug).length)} خودرو
                <ArrowLeft
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                />
              </span>
            </Link>
          </li>
        ))}
    </ul>
  )
}
