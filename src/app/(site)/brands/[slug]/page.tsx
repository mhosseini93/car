import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import {
  BadgeCheck,
  CalendarClock,
  ChevronLeft,
  FileCheck2,
  Phone,
  ShieldCheck,
  Wallet,
} from "lucide-react"

import { BrandGrid, BrandMark } from "@/components/home/brand-grid"
import { breadcrumbSchema, carListSchema, faqSchema, orgId } from "@/components/home/structured-data"
import { JsonLd } from "@/components/seo/json-ld"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { decodeSlug } from "@/lib/blog"
import { brandPath, getBrand, getBrands, type Brand, type BrandFaq, type Car } from "@/lib/catalog"
import { calcInstallment, fa, million } from "@/lib/format"
import { absoluteUrl, baseOpenGraph, siteConfig, socialImage } from "@/lib/site"

import { BrandCars } from "./brand-cars"

type Props = PageProps<"/brands/[slug]">

const defaultTitle = (brand: Pick<Brand, "name">) => `خرید اقساطی ${brand.name}؛ قیمت و شرایط اقساط`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = await getBrand(decodeSlug((await params).slug))
  if (!brand) return { title: "برند پیدا نشد", robots: { index: false } }

  const title = brand.metaTitle || `${defaultTitle(brand)} | ${siteConfig.name}`
  const description = brand.metaDescription || brand.intro
  const path = brandPath(brand.slug)
  const robots = { index: brand.robotsIndex, follow: brand.robotsFollow }

  return {
    // Meta titles are written in full, so skip the "| site name" template
    title: brand.metaTitle ? { absolute: brand.metaTitle } : defaultTitle(brand),
    description,
    alternates: { canonical: path },
    robots: { ...robots, googleBot: { ...robots, "max-image-preview": "large" } },
    openGraph: { ...baseOpenGraph, title, description, url: path, images: [socialImage] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  }
}

export default function BrandPage({ params }: Props) {
  return (
    <main id="main" className="flex-1">
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
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-muted h-72 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

function summarize(cars: Car[]) {
  if (!cars.length) return null
  const byMonthly = cars
    .map((car) => ({ car, ...calcInstallment(car.price, car.minDownPercent, 36) }))
    .sort((a, b) => a.monthly - b.monthly)
  const byDown = [...byMonthly].sort((a, b) => a.down - b.down)
  return {
    minPrice: Math.min(...cars.map((c) => c.price)),
    minDownPercent: Math.min(...cars.map((c) => c.minDownPercent)),
    cheapestDown: byDown[0],
    cheapestMonthly: byMonthly[0],
  }
}

// Used when the brand has no FAQ written in the panel; answers come from live car data
function defaultFaqs(brand: Brand, stats: ReturnType<typeof summarize>): BrandFaq[] {
  const faqs: BrandFaq[] = [
    {
      q: `برای خرید اقساطی ${brand.name} به ضامن نیاز است؟`,
      a: `خیر. برای خرید اقساطی خودروهای ${brand.name} در ${siteConfig.name} فقط چک صیادی خودتان کافی است و نیازی به ضامن یا کسر از حقوق ندارید.`,
    },
  ]
  if (!stats) return faqs

  faqs.push(
    {
      q: `حداقل پیش‌پرداخت خودروهای ${brand.name} چقدر است؟`,
      a: `پیش‌پرداخت خودروهای ${brand.name} از ${fa(stats.minDownPercent)} درصد قیمت شروع می‌شود. کمترین پیش‌پرداخت فعلی ${million(stats.cheapestDown.down)} تومان برای ${stats.cheapestDown.car.name} است.`,
    },
    {
      q: `کمترین قسط ماهانه ${brand.name} چقدر است؟`,
      a: `با بازپرداخت ۳۶ ماهه، قسط ${stats.cheapestMonthly.car.name} از حدود ${million(stats.cheapestMonthly.monthly)} تومان در ماه شروع می‌شود. با انتخاب پیش‌پرداخت بیشتر یا مدت طولانی‌تر، قسط ماهانه کمتر می‌شود.`,
    },
    {
      q: `کدام خودروهای ${brand.name} به‌صورت اقساطی فروخته می‌شوند؟`,
      a: `در حال حاضر ${brand.cars.map((c) => c.name).join("، ")} با شرایط اقساطی ۱۲ تا ۴۸ ماهه قابل خرید هستند.`,
    }
  )
  return faqs
}

async function BrandContent({ params }: Pick<Props, "params">) {
  const brand = await getBrand(decodeSlug((await params).slug))
  if (!brand) notFound()

  const allBrands = await getBrands()
  const stats = summarize(brand.cars)
  const faqs = brand.faqs.length ? brand.faqs : defaultFaqs(brand, stats)
  const path = brandPath(brand.slug)
  const crumbs = [
    { name: "خانه", path: "/" },
    { name: "برندهای خودرو", path: "/brands" },
    { name: brand.name, path },
  ]
  const perks = [
    { icon: ShieldCheck, text: "بدون ضامن، فقط با چک صیادی" },
    { icon: Wallet, text: stats ? `پیش‌پرداخت از ${fa(stats.minDownPercent)}٪ قیمت` : "پیش‌پرداخت منعطف" },
    { icon: CalendarClock, text: "بازپرداخت ۱۲ تا ۴۸ ماهه" },
    { icon: FileCheck2, text: "سند به نام خریدار از روز اول" },
  ]

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbSchema(crumbs),
            {
              "@type": "CollectionPage",
              "@id": absoluteUrl(path),
              url: absoluteUrl(path),
              name: defaultTitle(brand),
              description: brand.metaDescription || brand.intro,
              inLanguage: "fa-IR",
              isPartOf: { "@id": absoluteUrl("/#website") },
              publisher: { "@id": orgId },
              dateModified: brand.updatedAt,
              about: {
                "@type": "Brand",
                name: brand.name,
                ...(brand.englishName ? { alternateName: brand.englishName } : {}),
                ...(brand.logoUrl ? { logo: absoluteUrl(brand.logoUrl) } : {}),
              },
              ...(brand.cars.length
                ? { mainEntity: carListSchema(`خودروهای اقساطی ${brand.name}`, brand.cars) }
                : {}),
            },
            faqSchema(faqs),
          ],
        }}
      />

      {/* Hero */}
      <section
        aria-labelledby="brand-heading"
        className="relative overflow-hidden border-b"
        style={{ "--brand": brand.color } as React.CSSProperties}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-bl from-(--brand)/15 via-(--brand)/5 to-transparent"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_22rem] lg:items-center">
          <div>
            <nav aria-label="مسیر صفحه">
              <ol className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
                {crumbs.map((crumb, i) => (
                  <li key={crumb.path} className="flex items-center gap-1">
                    {i > 0 && <ChevronLeft className="size-4" aria-hidden="true" />}
                    {i < crumbs.length - 1 ? (
                      <Link href={crumb.path} className="hover:text-foreground">
                        {crumb.name}
                      </Link>
                    ) : (
                      <span aria-current="page" className="text-foreground font-medium">
                        {crumb.name}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-8 flex items-start gap-5">
              <BrandMark brand={brand} className="size-16 rounded-2xl text-2xl shadow-sm sm:size-20" />
              <div className="min-w-0">
                <h1 id="brand-heading" className="text-3xl leading-tight font-black sm:text-4xl">
                  خرید اقساطی خودروهای {brand.name}
                </h1>
                {brand.englishName && (
                  <p className="text-muted-foreground mt-1 text-sm" dir="ltr" lang="en">
                    {brand.englishName}
                  </p>
                )}
              </div>
            </div>
            {brand.intro && (
              <p className="text-muted-foreground mt-5 max-w-2xl text-lg leading-8">{brand.intro}</p>
            )}

            {stats && (
              <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="مدل موجود" value={`${fa(brand.cars.length)} خودرو`} />
                <Stat label="قیمت از" value={`${million(stats.minPrice)} تومان`} />
                <Stat label="پیش‌پرداخت از" value={`${million(stats.cheapestDown.down)} تومان`} />
                <Stat label="قسط ماهانه از" value={`${million(stats.cheapestMonthly.monthly)} تومان`} highlight />
              </dl>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="#cars">مشاهده خودروهای {brand.name}</a>
              </Button>
              <Button size="lg" variant="outline" className="bg-background/70" asChild>
                <a href={`tel:${siteConfig.phone}`}>
                  <Phone aria-hidden="true" />
                  مشاوره رایگان
                </a>
              </Button>
            </div>
          </div>

          <aside aria-labelledby="perks-heading" className="bg-background/80 rounded-2xl border p-6 shadow-sm backdrop-blur">
            <h2 id="perks-heading" className="flex items-center gap-2 font-extrabold">
              <BadgeCheck className="text-primary size-5" aria-hidden="true" />
              شرایط خرید اقساطی {brand.name}
            </h2>
            <ul className="mt-4 grid gap-3">
              {perks.map((perk) => (
                <li key={perk.text} className="flex items-center gap-3 text-sm">
                  <span className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-lg">
                    <perk.icon className="size-4" aria-hidden="true" />
                  </span>
                  {perk.text}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* Car list */}
      <section id="cars" aria-labelledby="cars-heading" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <h2 id="cars-heading" className="text-2xl font-extrabold sm:text-3xl">
          لیست خودروهای اقساطی {brand.name}
        </h2>
        <p className="text-muted-foreground mt-2">
          قیمت نقدی، پیش‌پرداخت و قسط ماهانه هر خودرو با بازپرداخت ۳۶ ماهه محاسبه شده است.
        </p>
        <BrandCars cars={brand.cars} brandName={brand.name} />
      </section>

      {/* Price table */}
      {brand.cars.length > 0 && (
        <section aria-labelledby="price-heading" className="bg-muted/50 border-y">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 id="price-heading" className="text-2xl font-extrabold sm:text-3xl">
              جدول قیمت و اقساط {brand.name}
            </h2>
            <p className="text-muted-foreground mt-2">مقایسه سریع شرایط اقساطی همه مدل‌ها در یک نگاه</p>
            <div className="bg-background mt-8 overflow-x-auto rounded-2xl border">
              <table className="w-full min-w-[40rem] text-sm">
                <caption className="sr-only">قیمت نقدی، پیش‌پرداخت و قسط ماهانه خودروهای {brand.name}</caption>
                <thead className="bg-muted/60 text-muted-foreground text-xs">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-start font-medium">خودرو</th>
                    <th scope="col" className="px-4 py-3 text-start font-medium">مدل</th>
                    <th scope="col" className="px-4 py-3 text-start font-medium">وضعیت</th>
                    <th scope="col" className="px-4 py-3 text-start font-medium">قیمت نقدی (تومان)</th>
                    <th scope="col" className="px-4 py-3 text-start font-medium">پیش‌پرداخت</th>
                    <th scope="col" className="px-4 py-3 text-start font-medium">قسط ۳۶ ماهه</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {brand.cars.map((car) => {
                    const { down, monthly } = calcInstallment(car.price, car.minDownPercent, 36)
                    return (
                      <tr key={car.id}>
                        <th scope="row" className="px-4 py-3 text-start font-bold">{car.name}</th>
                        <td className="px-4 py-3">{fa(car.year)}</td>
                        <td className="px-4 py-3">{car.condition === "new" ? "صفر" : `${fa(car.mileage)} کیلومتر`}</td>
                        <td className="px-4 py-3">{million(car.price)}</td>
                        <td className="px-4 py-3">
                          {million(down)} <span className="text-muted-foreground text-xs">({fa(car.minDownPercent)}٪)</span>
                        </td>
                        <td className="text-primary px-4 py-3 font-bold">{million(monthly)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mt-3 text-xs">
              مبالغ تقریبی است و قسط نهایی پس از اعتبارسنجی و انتخاب طرح در قرارداد مشخص می‌شود.
            </p>
          </div>
        </section>
      )}

      {/* Editorial content + FAQ */}
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-2">
        {brand.content && (
          <section aria-label={`درباره خرید اقساطی ${brand.name}`} className="min-w-0">
            <div
              className="prose prose-neutral dark:prose-invert prose-headings:font-extrabold prose-a:text-primary prose-img:rounded-xl max-w-none leading-8"
              dangerouslySetInnerHTML={{ __html: brand.content }}
            />
          </section>
        )}
        <section
          id="faq"
          aria-labelledby="faq-heading"
          className={brand.content ? "min-w-0" : "min-w-0 lg:col-span-2 lg:mx-auto lg:w-full lg:max-w-3xl"}
        >
          <h2 id="faq-heading" className="text-2xl font-extrabold">
            سوالات متداول خرید اقساطی {brand.name}
          </h2>
          <Accordion dir="rtl" type="single" collapsible className="mt-6">
            {faqs.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
                {/* forceMount keeps answers in the server HTML; closed ones are hidden */}
                <AccordionContent forceMount className="text-muted-foreground leading-7">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>

      {/* Other brands */}
      {allBrands && allBrands.length > 1 && (
        <section aria-labelledby="other-brands-heading" className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="other-brands-heading" className="text-2xl font-extrabold">
                خرید اقساطی سایر برندها
              </h2>
              <Link href="/brands" className="text-primary text-sm font-medium hover:underline">
                همه برندهای خودرو
              </Link>
            </div>
            <div className="mt-8">
              <BrandGrid brands={allBrands} excludeSlug={brand.slug} />
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-background/70 rounded-xl border p-3">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className={`mt-1 font-extrabold ${highlight ? "text-primary" : ""}`}>{value}</dd>
    </div>
  )
}
