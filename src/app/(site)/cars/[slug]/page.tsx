import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import {
  CalendarDays,
  Calculator,
  ChevronLeft,
  Cog,
  FileCheck2,
  Fuel,
  Gauge,
  Phone,
  ShieldCheck,
  Wallet,
} from "lucide-react"

import { BrandMark } from "@/components/home/brand-grid"
import { CarCard } from "@/components/home/car-card"
import { breadcrumbSchema, carSchema, faqSchema } from "@/components/home/structured-data"
import { JsonLd } from "@/components/seo/json-ld"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { decodeSlug } from "@/lib/blog"
import { brandPath, carPath, getCar, type CarDetail, type CarSpec } from "@/lib/catalog"
import { carDefaultDescription as defaultDescription, carDefaultTitle } from "@/lib/catalog-paths"
import { fa, faYear, installmentPlans, lowestInstallment, million, toman } from "@/lib/format"
import { absoluteUrl, baseOpenGraph, siteConfig, socialImage } from "@/lib/site"

import { CarGallery } from "./car-gallery"
import { InstallmentCalculator } from "./installment-calculator"

type Props = PageProps<"/cars/[slug]">

const defaultTitle = (car: Pick<CarDetail, "name">) => carDefaultTitle(car.name)

// Gallery for the page; falls back to the main photo for cars without one
const imagesOf = (car: CarDetail) =>
  car.gallery.length ? car.gallery : car.imageUrl ? [{ src: car.imageUrl, alt: car.imageAlt || car.name }] : []

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCar(decodeSlug((await params).slug))
  if (!car) return { title: "خودرو پیدا نشد", robots: { index: false } }

  const title = car.metaTitle || `${defaultTitle(car)} | ${siteConfig.name}`
  const description = car.metaDescription || defaultDescription(car)
  const path = carPath(car.slug)
  const robots = { index: car.robotsIndex, follow: car.robotsFollow }
  const photo = imagesOf(car)[0]
  // The car photo leads; the 1200×630 site image stays as a correctly sized fallback
  const images = [...(photo ? [{ url: photo.src, alt: photo.alt }] : []), socialImage]

  return {
    // Meta titles are written in full, so skip the "| site name" template
    title: car.metaTitle ? { absolute: car.metaTitle } : defaultTitle(car),
    description,
    alternates: { canonical: path },
    robots: { ...robots, googleBot: { ...robots, "max-image-preview": "large" } },
    openGraph: { ...baseOpenGraph, title, description, url: path, images },
    twitter: { card: "summary_large_image", title, description, images },
  }
}

export default function CarPage({ params }: Props) {
  return (
    <main id="main" className="flex-1">
      <Suspense fallback={<CarPageSkeleton />}>
        <CarContent params={params} />
      </Suspense>
    </main>
  )
}

function CarPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-10">
      <div className="bg-muted h-4 w-56 rounded" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="bg-muted aspect-[16/10] rounded-2xl" />
        <div className="space-y-4">
          <div className="bg-muted h-10 w-72 max-w-full rounded" />
          <div className="bg-muted h-4 w-48 rounded" />
          <div className="bg-muted h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// Specs in their admin/import order, grouped by section title
function groupSpecs(specs: CarSpec[]) {
  const groups = new Map<string, CarSpec[]>()
  for (const spec of specs) {
    const key = spec.group ?? "سایر مشخصات"
    groups.set(key, [...(groups.get(key) ?? []), spec])
  }
  return [...groups]
}

function carFaqs(car: CarDetail) {
  const plans = installmentPlans(car)
  const low = lowestInstallment(car)
  const shortest = plans[0]
  return [
    {
      q: `قیمت نقدی ${car.name} چقدر است؟`,
      a: `قیمت نقدی ${car.name} مدل ${faYear(car.year)} در حال حاضر ${toman(car.price)} است. قیمت‌ها بر اساس قیمت روز بازار به‌روز می‌شوند.`,
    },
    {
      q: `پیش‌پرداخت خرید اقساطی ${car.name} چقدر است؟`,
      a: `برای خرید اقساطی ${car.name} حداقل ${fa(car.minDownPercent)} درصد قیمت، یعنی ${toman(low.down)}، به‌عنوان پیش‌پرداخت پرداخت می‌شود و مابقی به‌صورت اقساط ماهانه تسویه می‌شود.`,
    },
    {
      q: `قسط ماهانه ${car.name} چقدر است؟`,
      a:
        plans.length > 1
          ? `قسط ماهانه ${car.name} بسته به مدت بازپرداخت از ${million(low.monthly)} تومان (${fa(low.months)} ماهه) تا ${million(shortest.monthly)} تومان (${fa(shortest.months)} ماهه) است.`
          : `قسط ماهانه ${car.name} با بازپرداخت ${fa(low.months)} ماهه حدود ${million(low.monthly)} تومان است.`,
    },
    {
      q: `برای خرید اقساطی ${car.name} ضامن لازم است؟`,
      a: `خیر. برای خرید اقساطی ${car.name} در ${siteConfig.name} چک صیادی خودتان کافی است و نیازی به ضامن یا کسر از حقوق ندارید.`,
    },
  ]
}

async function CarContent({ params }: Pick<Props, "params">) {
  const car = await getCar(decodeSlug((await params).slug))
  if (!car) notFound()

  const path = carPath(car.slug)
  const plans = installmentPlans(car)
  const low = lowestInstallment(car)
  const images = imagesOf(car)
  const faqs = carFaqs(car)
  const specGroups = groupSpecs(car.specs)
  const crumbs = [
    { name: "خانه", path: "/" },
    { name: "برندهای خودرو", path: "/brands" },
    { name: car.brand.name, path: brandPath(car.brand.slug) },
    { name: car.name, path },
  ]
  const facts = [
    { icon: CalendarDays, label: "مدل", value: faYear(car.year) },
    { icon: Gauge, label: "کارکرد", value: car.mileage ? `${fa(car.mileage)} کیلومتر` : "صفر کیلومتر" },
    { icon: Cog, label: "گیربکس", value: car.gearbox },
    { icon: Fuel, label: "سوخت", value: car.fuel },
  ]
  const perks = [
    { icon: ShieldCheck, text: "بدون ضامن، فقط با چک صیادی" },
    { icon: Wallet, text: `پیش‌پرداخت ${fa(car.minDownPercent)}٪ قیمت` },
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
              ...carSchema(car),
              "@id": absoluteUrl(`${path}#car`),
              description: car.metaDescription || defaultDescription(car),
              ...(images.length ? { image: images.map((image) => absoluteUrl(image.src)) } : {}),
              ...(car.specs.length
                ? {
                    additionalProperty: car.specs.map((spec) => ({
                      "@type": "PropertyValue",
                      name: spec.label,
                      value: spec.value,
                    })),
                  }
                : {}),
            },
            faqSchema(faqs),
          ],
        }}
      />

      {/* Hero */}
      <section aria-labelledby="car-heading" className="border-b" style={{ "--brand": car.brand.color } as React.CSSProperties}>
        <div className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
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

          <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <CarGallery images={images} name={car.name} color={car.color} />

            <div className="min-w-0">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={car.condition === "new" ? "default" : "secondary"}>
                  {car.condition === "new" ? "صفر کیلومتر" : "کارکرده"}
                </Badge>
                {car.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 id="car-heading" className="mt-3 text-3xl leading-tight font-black sm:text-4xl">
                خرید اقساطی {car.name}
              </h1>
              <Link
                href={brandPath(car.brand.slug)}
                className="text-muted-foreground hover:text-primary mt-3 inline-flex items-center gap-2 text-sm"
              >
                <BrandMark brand={car.brand} className="size-7 rounded-md text-xs" />
                خودروهای اقساطی {car.brand.name}
              </Link>

              <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {facts.map((fact) => (
                  <li key={fact.label} className="bg-muted/50 rounded-xl p-3">
                    <fact.icon className="text-muted-foreground size-4" aria-hidden="true" />
                    <span className="text-muted-foreground mt-2 block text-xs">{fact.label}</span>
                    <span className="block text-sm font-bold">{fact.value}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border p-4">
                <div>
                  <dt className="text-muted-foreground text-xs">قیمت نقدی</dt>
                  <dd className="mt-1 font-extrabold">{million(car.price)} تومان</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">پیش‌پرداخت</dt>
                  <dd className="mt-1 font-extrabold">{million(low.down)} تومان</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">قسط ماهانه از</dt>
                  <dd className="text-primary mt-1 font-extrabold">{million(low.monthly)} تومان</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <a href="#installments">
                    <Calculator aria-hidden="true" />
                    محاسبه اقساط
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href={`tel:${siteConfig.phone}`}>
                    <Phone aria-hidden="true" />
                    مشاوره و ثبت سفارش
                  </a>
                </Button>
              </div>

              <ul className="text-muted-foreground mt-6 grid gap-2 text-sm">
                {perks.map((perk) => (
                  <li key={perk.text} className="flex items-center gap-2">
                    <perk.icon className="text-primary size-4 shrink-0" aria-hidden="true" />
                    {perk.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Installments */}
      <section id="installments" aria-labelledby="installments-heading" className="bg-muted/50 scroll-mt-20 border-b">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 id="installments-heading" className="text-2xl font-extrabold sm:text-3xl">
            شرایط و جدول اقساط {car.name}
          </h2>
          <p className="text-muted-foreground mt-2">
            با پرداخت {fa(car.minDownPercent)}٪ قیمت به‌عنوان پیش‌پرداخت، مابقی را در{" "}
            {plans.length > 1 ? `${fa(plans[0].months)} تا ${fa(plans[plans.length - 1].months)}` : fa(low.months)} ماه
            پرداخت کنید.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
            <div className="bg-background overflow-x-auto rounded-2xl border">
              <table className="w-full min-w-[32rem] text-sm">
                <caption className="sr-only">
                  مبلغ قسط ماهانه و مجموع پرداختی {car.name} برای هر مدت بازپرداخت
                </caption>
                <thead className="bg-muted/60 text-muted-foreground text-xs">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-start font-medium">مدت بازپرداخت</th>
                    <th scope="col" className="px-4 py-3 text-start font-medium">پیش‌پرداخت (تومان)</th>
                    <th scope="col" className="px-4 py-3 text-start font-medium">قسط ماهانه (تومان)</th>
                    <th scope="col" className="px-4 py-3 text-start font-medium">مجموع پرداختی (تومان)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {plans.map((plan) => (
                    <tr key={plan.months}>
                      <th scope="row" className="px-4 py-3 text-start font-bold">{fa(plan.months)} ماهه</th>
                      <td className="px-4 py-3">{million(plan.down)}</td>
                      <td className="text-primary px-4 py-3 font-bold">{million(plan.monthly)}</td>
                      <td className="px-4 py-3">{million(plan.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-muted-foreground border-t px-4 py-3 text-xs">
                {low.estimated
                  ? "مبالغ تقریبی است و قسط نهایی پس از اعتبارسنجی و انتخاب طرح در قرارداد مشخص می‌شود."
                  : "مبالغ بر اساس قیمت روز است و با تغییر قیمت خودرو به‌روز می‌شود."}
              </p>
            </div>

            <InstallmentCalculator
              name={car.name}
              price={car.price}
              minDownPercent={car.minDownPercent}
              installments={car.installments}
            />
          </div>
        </div>
      </section>

      {/* Specs */}
      <section aria-labelledby="specs-heading" className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="specs-heading" className="text-2xl font-extrabold sm:text-3xl">
          مشخصات فنی {car.name}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <SpecGroup
            title="اطلاعات کلی"
            specs={[
              { label: "برند", value: car.brand.name },
              { label: "سال ساخت", value: faYear(car.year) },
              { label: "وضعیت", value: car.condition === "new" ? "صفر کیلومتر" : "کارکرده" },
              ...(car.mileage ? [{ label: "کارکرد", value: `${fa(car.mileage)} کیلومتر` }] : []),
              { label: "گیربکس", value: car.gearbox },
              { label: "نوع سوخت", value: car.fuel },
            ]}
          />
          {specGroups.map(([title, specs]) => (
            <SpecGroup key={title} title={title} specs={specs} />
          ))}
        </div>
      </section>

      {/* Editorial content */}
      {car.content && (
        <section aria-label={`بررسی و شرایط خرید ${car.name}`} className="border-t">
          <div className="mx-auto max-w-3xl px-4 py-14">
            <div
              className="prose prose-neutral dark:prose-invert prose-headings:font-extrabold prose-a:text-primary prose-img:rounded-xl max-w-none leading-8"
              dangerouslySetInnerHTML={{ __html: car.content }}
            />
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-heading" className="border-t">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 id="faq-heading" className="text-2xl font-extrabold">
            سوالات متداول خرید اقساطی {car.name}
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
        </div>
      </section>

      {/* Related */}
      {car.related.length > 0 && (
        <section aria-labelledby="related-heading" className="bg-muted/50 border-t">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="related-heading" className="text-2xl font-extrabold">
                خودروهای مشابه {car.name}
              </h2>
              <Link href={brandPath(car.brand.slug)} className="text-primary text-sm font-medium hover:underline">
                همه خودروهای {car.brand.name}
              </Link>
            </div>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {car.related.map((item) => (
                <li key={item.id}>
                  <CarCard car={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}

function SpecGroup({ title, specs }: { title: string; specs: Pick<CarSpec, "label" | "value">[] }) {
  return (
    <div className="rounded-2xl border">
      <h3 className="bg-muted/50 rounded-t-2xl border-b px-4 py-3 font-bold">{title}</h3>
      <dl className="divide-y text-sm">
        {specs.map((spec) => (
          <div key={spec.label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 px-4 py-2.5">
            <dt className="text-muted-foreground">{spec.label}</dt>
            <dd className="font-medium">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
