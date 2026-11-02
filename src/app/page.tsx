import type { Metadata } from "next"
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  ClipboardCheck,
  FileText,
  Headphones,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CarList } from "@/components/home/car-list"
import { faqs } from "@/components/home/data"
import { InstallmentCalculator } from "@/components/home/installment-calculator"
import { Logo, SiteHeader } from "@/components/home/site-header"
import { homeStructuredData } from "@/components/home/structured-data"
import { JsonLd } from "@/components/seo/json-ld"
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

const stats = [
  { value: "+۱۲٬۰۰۰", label: "خریدار راضی" },
  { value: "تا ۴۸ ماه", label: "مدت بازپرداخت" },
  { value: "۷۲ ساعته", label: "تحویل فوری" },
]

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

export default function Home() {
  return (
    <>
      <JsonLd data={homeStructuredData} />
      <SiteHeader />

      <main id="main" className="flex-1">
        {/* Hero */}
        <section aria-labelledby="hero-heading" className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="bg-primary/10 absolute -top-40 -left-40 size-[32rem] rounded-full blur-3xl"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
            <div>
              <Badge variant="secondary" className="mb-5 gap-1.5 px-3 py-1">
                <Sparkles className="text-primary size-3.5" aria-hidden="true" />
                بدون ضامن، فقط با چک صیادی
              </Badge>
              <h1
                id="hero-heading"
                className="text-4xl leading-tight font-black sm:text-5xl sm:leading-tight"
              >
                خرید اقساطی خودرو
                <span className="text-primary block">بدون ضامن، با قسط راحت</span>
              </h1>
              <p className="text-muted-foreground mt-5 max-w-lg text-lg leading-8">
                <strong className="text-foreground font-semibold">خرید اقساطی خودرو</strong>ی
                صفر و کارکرده با پیش‌پرداخت کم، بازپرداخت تا ۴۸ ماه و تحویل فوری. همه مراحل
                آنلاین و بدون مراجعه حضوری.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <a href="#cars">
                    مشاهده خودروها
                    <ArrowLeft aria-hidden="true" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#steps">مراحل خرید</a>
                </Button>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-muted-foreground text-xs">{s.label}</dt>
                    <dd className="mt-1 text-xl font-extrabold">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <InstallmentCalculator className="w-full lg:max-w-md lg:justify-self-end" />
          </div>
        </section>

        {/* Features strip */}
        <section aria-labelledby="features-heading" className="bg-muted/50 border-y">
          <h2 id="features-heading" className="sr-only">
            مزایای خرید اقساطی خودرو از {siteConfig.name}
          </h2>
          <ul className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Cars */}
        <section
          id="cars"
          aria-labelledby="cars-heading"
          className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20"
        >
          <CarList />
        </section>

        {/* Steps */}
        <section
          id="steps"
          aria-labelledby="steps-heading"
          className="bg-muted/50 scroll-mt-16 border-y"
        >
          <div className="mx-auto max-w-6xl px-4 py-20">
            <div className="mx-auto max-w-xl text-center">
              <h2 id="steps-heading" className="text-2xl font-extrabold sm:text-3xl">
                مراحل خرید اقساطی خودرو در ۴ قدم
              </h2>
              <p className="text-muted-foreground mt-2">
                از انتخاب خودرو تا تحویل سوئیچ، همه چیز شفاف و سریع
              </p>
            </div>
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

        {/* FAQ */}
        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="mx-auto max-w-3xl scroll-mt-16 px-4 py-20"
        >
          <div className="text-center">
            <h2 id="faq-heading" className="text-2xl font-extrabold sm:text-3xl">
              سوالات متداول خرید اقساطی خودرو
            </h2>
            <p className="text-muted-foreground mt-2">پاسخ پرتکرارترین سوالات خریداران</p>
          </div>
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

      <footer className="border-t">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-7">
              خودرو قسطی، مرجع خرید اقساطی خودروی صفر و کارکرده با شرایط شفاف و بدون ضامن.
            </p>
          </div>
          <div>
            <h2 className="font-bold">دسترسی سریع</h2>
            <ul className="text-muted-foreground mt-4 grid gap-2 text-sm">
              <li><a href="#cars" className="hover:text-foreground">خودروها</a></li>
              <li><a href="#calculator" className="hover:text-foreground">محاسبه اقساط</a></li>
              <li><a href="#steps" className="hover:text-foreground">مراحل خرید</a></li>
              <li><a href="#faq" className="hover:text-foreground">سوالات متداول</a></li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold">تماس با ما</h2>
            <address className="text-muted-foreground mt-4 grid gap-3 text-sm not-italic">
              <a href={`tel:${siteConfig.phone}`} className="hover:text-foreground flex items-center gap-2">
                <Phone className="size-4" aria-hidden="true" />
                <span dir="ltr">{siteConfig.phoneDisplay}</span>
              </a>
              <a href={`mailto:${siteConfig.email}`} className="hover:text-foreground flex items-center gap-2">
                <Mail className="size-4" aria-hidden="true" /> {siteConfig.email}
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" />
                {siteConfig.address.city}، {siteConfig.address.street}
              </p>
            </address>
          </div>
        </div>
        <div className="text-muted-foreground border-t py-6 text-center text-xs">
          © ۱۴۰۵ خودرو قسطی. تمامی حقوق محفوظ است.
        </div>
      </footer>
    </>
  )
}
