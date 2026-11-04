import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Eye, FileCheck2, HandCoins, Headphones, Scale, ShieldCheck } from "lucide-react"

import { breadcrumbSchema, orgId } from "@/components/home/structured-data"
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb"
import { JsonLd } from "@/components/seo/json-ld"
import { Button } from "@/components/ui/button"
import { getBrands } from "@/lib/catalog"
import { fa } from "@/lib/format"
import { absoluteUrl, baseOpenGraph, siteConfig, socialImage } from "@/lib/site"

const title = "درباره ما؛ مرجع خرید اقساطی خودرو بدون ضامن"
const description =
  "با خودرو قسطی آشنا شوید؛ مرجع خرید اقساطی خودروی صفر و کارکرده بدون ضامن با قیمت شفاف، پیش‌پرداخت کم، اقساط ۱۲ تا ۴۸ ماهه و پشتیبانی تا تحویل خودرو."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { ...baseOpenGraph, title, description, url: "/about", images: [socialImage] },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
}

const crumbs = [
  { name: "خانه", path: "/" },
  { name: "درباره ما", path: "/about" },
]

const values = [
  {
    icon: Eye,
    title: "شفافیت کامل",
    text: "قیمت نقدی، پیش‌پرداخت، مبلغ هر قسط و مجموع پرداختی پیش از هر تصمیمی جلوی چشم شماست؛ بدون هزینه پنهان.",
  },
  {
    icon: ShieldCheck,
    title: "بدون ضامن",
    text: "خرید با چک صیادی خود خریدار انجام می‌شود تا برای خرید خودرو مجبور به پیدا کردن ضامن یا کسر از حقوق نباشید.",
  },
  {
    icon: HandCoins,
    title: "متناسب با بودجه شما",
    text: "با انتخاب مدت بازپرداخت و مبلغ پیش‌پرداخت، طرحی را پیدا می‌کنید که قسط ماهانه‌اش با درآمدتان هماهنگ باشد.",
  },
  {
    icon: FileCheck2,
    title: "قرارداد رسمی",
    text: "همه خریدها با قرارداد مکتوب و سند به نام خریدار انجام می‌شود و جزئیات اقساط در قرارداد ثبت می‌شود.",
  },
  {
    icon: Scale,
    title: "مشاوره بی‌طرفانه",
    text: "کارشناسان ما خودروها و طرح‌های مختلف را کنار هم مقایسه می‌کنند تا بهترین انتخاب را برای شرایط شما پیشنهاد دهند.",
  },
  {
    icon: Headphones,
    title: "همراهی تا تحویل",
    text: "از اولین تماس تا اعتبارسنجی، امضای قرارداد و تحویل سوئیچ، یک کارشناس پیگیر درخواست شما است.",
  },
]

export default async function AboutPage() {
  const brands = (await getBrands()) ?? []
  const brandCount = brands.filter((b) => b.carCount > 0).length
  const carCount = brands.reduce((sum, b) => sum + b.carCount, 0)

  const stats = [
    ...(carCount ? [{ value: fa(carCount), label: "خودروی اقساطی" }, { value: fa(brandCount), label: "برند خودرو" }] : []),
    { value: "۱۲ تا ۴۸", label: "ماه بازپرداخت" },
    { value: "از ۲۵٪", label: "پیش‌پرداخت" },
  ]

  return (
    <main id="main" className="flex-1">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbSchema(crumbs),
            {
              "@type": "AboutPage",
              name: title,
              description,
              url: absoluteUrl("/about"),
              mainEntity: { "@id": orgId },
            },
          ],
        }}
      />

      <section aria-labelledby="about-heading" className="bg-muted/50 border-b">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <PageBreadcrumb items={crumbs} />
          <h1 id="about-heading" className="mt-8 text-3xl font-black sm:text-4xl">
            درباره خودرو قسطی
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-8">
            {siteConfig.name} برای این ساخته شده که خرید اقساطی خودرو ساده، شفاف و بدون دردسر باشد. ما
            خودروهای صفر و کارکرده برندهای مختلف را با شرایط اقساطی روشن در یک‌جا جمع کرده‌ایم تا بتوانید
            پیش از خرید، قیمت و قسط واقعی هر خودرو را ببینید و مقایسه کنید.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-background flex flex-col gap-1 rounded-2xl border p-5 text-center">
                <dt className="text-muted-foreground text-sm">{stat.label}</dt>
                <dd className="text-primary order-first text-2xl font-black sm:text-3xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="story-heading" className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
        <div>
          <h2 id="story-heading" className="text-2xl font-extrabold sm:text-3xl">
            چرا خودرو قسطی را راه انداختیم؟
          </h2>
          <div className="text-muted-foreground mt-5 grid gap-4 leading-8">
            <p>
              برای بسیاری از خانواده‌ها خرید نقدی خودرو ممکن نیست و خرید اقساطی تنها راه رسیدن به خودروی دلخواه
              است. اما شرایط فروش اقساطی معمولاً پیچیده است: نرخ‌ها روشن نیست، ضامن لازم است و مبلغ نهایی تا
              روز امضای قرارداد مشخص نمی‌شود.
            </p>
            <p>
              ما این مسیر را ساده کرده‌ایم. در {siteConfig.name} برای هر خودرو قیمت نقدی، پیش‌پرداخت، قسط ماهانه
              و مجموع پرداختی نوشته شده و با ماشین‌حساب اقساط می‌توانید طرح‌های مختلف را خودتان مقایسه کنید.
            </p>
          </div>
        </div>
        <div className="bg-primary text-primary-foreground grid content-center gap-4 rounded-3xl p-8 sm:p-10">
          <h2 className="text-2xl font-extrabold">ماموریت ما</h2>
          <p className="text-lg leading-8 opacity-95">
            اینکه هر ایرانی بتواند با درآمد ماهانه خودش، بدون ضامن و با اطلاعات کامل، خودروی مناسبش را اقساطی
            بخرد.
          </p>
        </div>
      </section>

      <section aria-labelledby="values-heading" className="bg-muted/50 border-y">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mx-auto max-w-xl text-center">
            <h2 id="values-heading" className="text-2xl font-extrabold sm:text-3xl">
              اصولی که به آن پایبندیم
            </h2>
            <p className="text-muted-foreground mt-2">آنچه خرید اقساطی خودرو از {siteConfig.name} را متفاوت می‌کند</p>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((item) => (
              <li key={item.title} className="bg-card rounded-2xl border p-6">
                <span className="bg-primary/10 text-primary grid size-12 place-items-center rounded-xl">
                  <item.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-7">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="about-cta-heading" className="px-4 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-3xl border p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="about-cta-heading" className="text-2xl font-extrabold">
              آماده‌اید خودروی اقساطی‌تان را انتخاب کنید؟
            </h2>
            <p className="text-muted-foreground mt-2 leading-7">
              خودروها و شرایط اقساط را ببینید یا برای مشاوره رایگان با کارشناسان ما تماس بگیرید.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/brands">
                مشاهده خودروهای اقساطی
                <ArrowLeft aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">تماس با ما</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
