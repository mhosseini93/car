import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { brandPath, type BrandSummary } from "@/lib/catalog"
import { fa } from "@/lib/format"
import { cn } from "@/lib/utils"

// Uploaded logo, or a monogram in the brand color
export function BrandMark({
  brand,
  className,
}: {
  brand: Pick<BrandSummary, "name" | "color" | "logoUrl">
  className?: string
}) {
  if (brand.logoUrl) {
    return (
      <span className={cn("bg-background relative block size-12 shrink-0 overflow-hidden rounded-xl border", className)}>
        <Image
          src={brand.logoUrl}
          alt={`لوگوی ${brand.name}`}
          fill
          sizes="96px"
          unoptimized={!brand.logoUrl.startsWith("/")}
          className="object-contain p-1.5"
        />
      </span>
    )
  }
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

export function BrandGrid({ brands, excludeSlug }: { brands: BrandSummary[]; excludeSlug?: string }) {
  const list = brands.filter((brand) => brand.slug !== excludeSlug)
  if (!list.length) return null

  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {list.map((brand) => (
        <li key={brand.slug}>
          <Link
            href={brandPath(brand.slug)}
            className="group bg-card hover:border-primary/40 focus-visible:ring-ring/50 flex h-full flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px]"
          >
            <BrandMark brand={brand} />
            <span className="font-bold">{brand.name}</span>
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              {fa(brand.carCount)} خودرو
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
