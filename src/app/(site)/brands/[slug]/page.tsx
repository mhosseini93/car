import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ChevronLeft } from "lucide-react"

import { BrandGrid, BrandMark } from "@/components/home/brand-grid"
import { CarCard } from "@/components/home/car-card"
import { brands, getBrand, getBrandCars } from "@/components/home/data"
import { breadcrumbSchema, carListSchema } from "@/components/home/structured-data"
import { JsonLd } from "@/components/seo/json-ld"
import { calcInstallment, fa, million } from "@/lib/format"
import { baseOpenGraph, socialImage } from "@/lib/site"

export function generateStaticParams() {
  return brands.map((brand) => ({ slug: brand.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/brands/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const brand = getBrand(slug)
  if (!brand) return {}

  const title = `خرید اقساطی ${brand.name} بدون ضامن`
  const path = `/brands/${brand.slug}`

  return {
    title,
    description: brand.description,
    alternates: { canonical: path },
    openGraph: {
      ...baseOpenGraph,
      title,
      description: brand.description,
      url: path,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: brand.description,
      images: [socialImage],
    },
  }
}

export default function BrandPage({ params }: PageProps<"/brands/[slug]">) {
  return (
    <main id="main" className="flex-1">
      {/* Brand slugs are prerendered by generateStaticParams, so this content is
          in the static HTML; Suspense only matters for client navigations */}
      <Suspense fallback={<BrandPageSkeleton />}>
        <BrandContent params={params} />
      </Suspense>
    </main>
  )
}

function BrandPageSkeleton() {
  return (
    <div className="bg-muted/50 border-b">
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-10">
        <div className="bg-muted h-4 w-40 rounded" />
        <div className="bg-muted mt-8 h-10 w-80 max-w-full rounded" />
        <div className="bg-muted mt-4 h-4 w-96 max-w-full rounded" />
      </div>
    </div>
  )
}

async function BrandContent({ params }: { params: PageProps<"/brands/[slug]">["params"] }) {
  const { slug } = await params
  const brand = getBrand(slug)
  if (!brand) notFound()

  const brandCars = getBrandCars(brand.slug)
  const minDown = Math.min(...brandCars.map((c) => (c.price * c.minDownPercent) / 100))
  const minMonthly = Math.min(
    ...brandCars.map((c) => calcInstallment(c.price, c.minDownPercent, 36).monthly)
  )
  const crumbs = [
    { name: "خانه", path: "/" },
    { name: brand.name, path: `/brands/${brand.slug}` },
  ]

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbSchema(crumbs),
            carListSchema(`خودروهای ${brand.name}`, brandCars),
          ],
        }}
      />

      <section aria-labelledby="brand-heading" className="bg-muted/50 border-b">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <nav aria-label="مسیر صفحه">
            <ol className="text-muted-foreground flex items-center gap-1 text-sm">
              <li>
                <Link href="/" className="hover:text-foreground">
                  خانه
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronLeft className="size-4" />
              </li>
              <li>
                <Link href="/#brands" className="hover:text-foreground">
                  برندها
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronLeft className="size-4" />
              </li>
              <li aria-current="page" className="text-foreground font-medium">
                {brand.name}
              </li>
            </ol>
          </nav>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <BrandMark brand={brand} className="size-16 text-2xl" />
            <div>
              <h1 id="brand-heading" className="text-3xl font-black sm:text-4xl">
                خرید اقساطی خودروهای {brand.name}
              </h1>
              <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
                {brand.description}
              </p>
            </div>
          </div>

          <dl className="mt-8 grid max-w-xl grid-cols-3 gap-4">
            <div>
              <dt className="text-muted-foreground text-xs">خودروی موجود</dt>
              <dd className="mt-1 text-xl font-extrabold">{fa(brandCars.length)} مدل</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">پیش‌پرداخت از</dt>
              <dd className="mt-1 text-xl font-extrabold">{million(minDown)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">قسط ماهانه از</dt>
              <dd className="text-primary mt-1 text-xl font-extrabold">{million(minMonthly)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="brand-cars-heading" className="mx-auto max-w-6xl px-4 py-16">
        <h2 id="brand-cars-heading" className="text-2xl font-extrabold">
          لیست خودروهای اقساطی {brand.name}
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brandCars.map((car) => (
            <li key={car.id}>
              <CarCard car={car} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="other-brands-heading" className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="other-brands-heading" className="text-2xl font-extrabold">
            سایر برندها
          </h2>
          <div className="mt-8">
            <BrandGrid excludeSlug={brand.slug} />
          </div>
        </div>
      </section>
    </>
  )
}
