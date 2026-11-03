import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronLeft } from "lucide-react"

import { BrandMark } from "@/components/home/brand-grid"
import { breadcrumbSchema } from "@/components/home/structured-data"
import { JsonLd } from "@/components/seo/json-ld"
import { brandPath, getBrands } from "@/lib/catalog"
import { fa } from "@/lib/format"
import { absoluteUrl, baseOpenGraph, socialImage } from "@/lib/site"

const title = "برندهای خودرو برای خرید اقساطی بدون ضامن"
const description =
  "لیست همه برندهای خودرو برای خرید اقساطی؛ ایران‌خودرو، سایپا، مدیران‌خودرو و برندهای دیگر را با پیش‌پرداخت کم و اقساط تا ۴۸ ماه مقایسه کنید."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/brands" },
  openGraph: { ...baseOpenGraph, title, description, url: "/brands", images: [socialImage] },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
}

export default async function BrandsPage() {
  const brands = (await getBrands()) ?? []
  const crumbs = [
    { name: "خانه", path: "/" },
    { name: "برندهای خودرو", path: "/brands" },
  ]

  return (
    <main id="main" className="flex-1">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbSchema(crumbs),
            {
              "@type": "ItemList",
              name: title,
              itemListElement: brands.map((brand, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: brand.name,
                url: absoluteUrl(brandPath(brand.slug)),
              })),
            },
          ],
        }}
      />

      <section aria-labelledby="brands-heading" className="bg-muted/50 border-b">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <nav aria-label="مسیر صفحه">
            <ol className="text-muted-foreground flex items-center gap-1 text-sm">
              <li>
                <Link href="/" className="hover:text-foreground">خانه</Link>
              </li>
              <li aria-hidden="true">
                <ChevronLeft className="size-4" />
              </li>
              <li aria-current="page" className="text-foreground font-medium">برندهای خودرو</li>
            </ol>
          </nav>
          <h1 id="brands-heading" className="mt-8 text-3xl font-black sm:text-4xl">
            برندهای خودرو برای خرید اقساطی
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
            برند مورد نظرتان را انتخاب کنید تا قیمت، پیش‌پرداخت و قسط ماهانه همه خودروهای اقساطی آن را ببینید.
            همه خودروها بدون ضامن و با بازپرداخت ۱۲ تا ۴۸ ماهه عرضه می‌شوند.
          </p>
        </div>
      </section>

      <section aria-label="لیست برندها" className="mx-auto max-w-6xl px-4 py-14">
        {brands.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <li key={brand.slug}>
                <Link
                  href={brandPath(brand.slug)}
                  className="group bg-card hover:border-primary/40 focus-visible:ring-ring/50 flex h-full flex-col gap-4 rounded-2xl border p-6 transition-all outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px]"
                >
                  <div className="flex items-center gap-4">
                    <BrandMark brand={brand} className="size-14" />
                    <div>
                      <h2 className="text-lg font-extrabold">خرید اقساطی {brand.name}</h2>
                      <p className="text-muted-foreground text-xs">{fa(brand.carCount)} خودروی موجود</p>
                    </div>
                  </div>
                  {brand.intro && <p className="text-muted-foreground text-sm leading-7">{brand.intro}</p>}
                  <span className="text-primary mt-auto flex items-center gap-1 text-sm font-medium">
                    مشاهده خودروهای {brand.name}
                    <ArrowLeft aria-hidden="true" className="size-4 transition-transform group-hover:-translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center">در حال حاضر برندی برای نمایش وجود ندارد.</p>
        )}
      </section>
    </main>
  )
}
