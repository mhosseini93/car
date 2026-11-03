import type { Metadata } from "next"
import {
  BadgeCheck,
  CalendarClock,
  ClipboardCheck,
  FileText,
  Headphones,
  KeyRound,
  Search,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BrandGrid } from "@/components/home/brand-grid"
import { faqs } from "@/components/home/data"
import { Hero } from "@/components/home/hero"
import { LatestPosts } from "@/components/home/latest-posts"
import { PopularCars } from "@/components/home/popular-cars"
import { homeStructuredData } from "@/components/home/structured-data"
import { JsonLd } from "@/components/seo/json-ld"
import { getBrands, getPopularCars } from "@/lib/catalog"
import { baseOpenGraph, siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: { absolute: siteConfig.title },
  alternates: { canonical: "/" },
  openGraph: {
    ...baseOpenGraph,
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
  },
}

const steps = [
  { icon: Search, title: "انتخاب خودرو", text: "خودروی دلخواه و طرح اقساطی مناسب را انتخاب کنید." },
  { icon: FileText, title: "ثبت درخواست آنلاین", text: "مدارک را بدون مراجعه حضوری و در چند دقیقه بارگذاری کنید." },
  { icon: ClipboardCheck, title: "اعتبارسنجی سریع", text: "نتیجه اعتبارسنجی حداکثر ظرف ۲۴ ساعت اعلام می‌شود." },
  { icon: KeyRound, title: "تحویل خودرو", text: "قرارداد را امضا کنید و سوئیچ خودرو را تحویل بگیرید." },
]

const features = [
  { icon: ShieldCheck, title: "بدون ضامن", text: "فقط با چک صیادی خودتان، بدون ضامن و کسر از حقوق." },
  { icon: Wallet, title: "پیش‌پرداخت کم", text: "پیش‌پرداخت از ۲۵ درصد قیمت خودرو." },
  { icon: CalendarClock, title: "اقساط منعطف", text: "بازپرداخت ۱۲ تا ۴۸ ماهه با قسط ثابت." },
  { icon: Truck, title: "تحویل سریع", text: "تحویل خودروهای موجود در کمتر از ۷۲ ساعت." },
  { icon: BadgeCheck, title: "سند به نام خریدار", text: "سند از روز اول به نام شما صادر می‌شود." },
  { icon: Headphones, title: "پشتیبانی کامل", text: "کارشناسان ما در تمام مراحل خرید کنار شما هستند." },
]

function SectionHeading({
  id,
  title,
  description,
  center,
}: {
  id: string
  title: string
  description: string
  center?: boolean
}) {
  return (
    <div className={center ? "mx-auto max-w-xl text-center" : undefined}>
      <h2 id={id} className="text-2xl font-extrabold sm:text-3xl">
        {title}
      </h2>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  )
}

export default async function Home() {
  const [brands, popularCars] = await Promise.all([getBrands(), getPopularCars()])

  return (
    <main id="main" className="flex-1">
      <JsonLd data={homeStructuredData(brands ?? [], popularCars ?? [])} />

      <Hero cars={popularCars ?? []} />

      {/* Brands */}
      <section
        id="brands"
        aria-labelledby="brands-heading"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16"
      >
        <SectionHeading
          id="brands-heading"
          title="خرید اقساطی خودرو بر اساس برند"
          description="برند مورد نظرتان را انتخاب کنید و همه خودروهای اقساطی آن را ببینید"
        />
        <div className="mt-8">
          <BrandGrid brands={brands ?? []} />
        </div>
      </section>

      {/* Popular cars */}
      <section
        id="popular"
        aria-labelledby="popular-heading"
        className="bg-muted/50 scroll-mt-16 border-y"
      >
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHeading
            id="popular-heading"
            title="پرمخاطب‌ترین خودروهای اقساطی"
            description="خودروهایی که در هفته گذشته بیشترین بازدید را داشته‌اند"
          />
          <div className="mt-8">
            <PopularCars cars={popularCars ?? []} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          مزایای خرید اقساطی خودرو از {siteConfig.name}
        </h2>
        <ul className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li key={f.title} className="flex gap-4">
              <span className="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
                <f.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-bold">{f.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-6">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section
        id="steps"
        aria-labelledby="steps-heading"
        className="bg-muted/50 scroll-mt-16 border-y"
      >
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionHeading
            id="steps-heading"
            title="مراحل خرید اقساطی خودرو در ۴ قدم"
            description="از انتخاب خودرو تا تحویل سوئیچ، همه چیز شفاف و سریع"
            center
          />
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="bg-background relative rounded-2xl border p-6">
                <span
                  aria-hidden="true"
                  className="text-primary/15 absolute top-4 left-5 text-5xl font-black"
                >
                  {(i + 1).toLocaleString("fa-IR")}
                </span>
                <span className="bg-primary text-primary-foreground grid size-11 place-items-center rounded-xl">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-bold">{step.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Latest blog posts */}
      <LatestPosts />

      {/* FAQ */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="mx-auto max-w-3xl scroll-mt-16 px-4 py-20"
      >
        <SectionHeading
          id="faq-heading"
          title="سوالات متداول خرید اقساطی خودرو"
          description="پاسخ پرتکرارترین سوالات خریداران"
          center
        />
        <Accordion dir="rtl" type="single" collapsible className="mt-10">
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

      {/* CTA */}
      <section aria-labelledby="cta-heading" className="px-4 pb-20">
        <div className="bg-primary text-primary-foreground mx-auto grid max-w-6xl items-center gap-8 rounded-3xl px-6 py-12 sm:px-12 lg:grid-cols-2">
          <div>
            <h2 id="cta-heading" className="text-2xl font-extrabold sm:text-3xl">
              مشاوره رایگان خرید اقساطی
            </h2>
            <p className="mt-3 leading-7 opacity-90">
              شماره موبایل خود را وارد کنید تا کارشناسان ما بهترین طرح اقساطی را برایتان پیدا کنند.
            </p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="cta-phone" className="sr-only">
              شماره موبایل
            </label>
            <Input
              id="cta-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              dir="ltr"
              placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰"
              className="bg-background text-foreground h-11 text-right"
            />
            <Button type="submit" size="lg" variant="secondary" className="h-11">
              درخواست تماس
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}
