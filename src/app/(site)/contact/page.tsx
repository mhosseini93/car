import type { Metadata } from "next"
import Link from "next/link"
import { Clock, Mail, MapPin, Phone } from "lucide-react"

import { breadcrumbSchema, faqSchema, orgId } from "@/components/home/structured-data"
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb"
import { JsonLd } from "@/components/seo/json-ld"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { absoluteUrl, baseOpenGraph, siteConfig, socialImage } from "@/lib/site"

import { ContactForm } from "./contact-form"

const title = "تماس با ما؛ مشاوره رایگان خرید اقساطی خودرو"
const description =
  "برای مشاوره رایگان خرید اقساطی خودرو بدون ضامن با خودرو قسطی تماس بگیرید یا فرم تماس را پر کنید؛ کارشناسان ما شرایط اقساط را برایتان بررسی می‌کنند."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: { ...baseOpenGraph, title, description, url: "/contact", images: [socialImage] },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
}

const crumbs = [
  { name: "خانه", path: "/" },
  { name: "تماس با ما", path: "/contact" },
]

const channels = [
  {
    icon: Phone,
    title: "تلفن مشاوره و فروش",
    value: <span dir="ltr">{siteConfig.phoneDisplay}</span>,
    href: `tel:${siteConfig.phone}`,
  },
  { icon: Mail, title: "ایمیل", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { icon: MapPin, title: "دفتر مرکزی", value: `${siteConfig.address.city}، ${siteConfig.address.street}` },
  { icon: Clock, title: "ساعات کاری", value: siteConfig.hours },
]

const faqs = [
  {
    q: "پس از ارسال فرم تماس، چه زمانی با من تماس گرفته می‌شود؟",
    a: "کارشناسان ما پیام‌ها را در ساعات کاری بررسی می‌کنند و معمولاً در همان روز کاری با شماره موبایلی که وارد کرده‌اید تماس می‌گیرند.",
  },
  {
    q: "برای مشاوره خرید اقساطی باید حضوری مراجعه کنم؟",
    a: "خیر. مشاوره، محاسبه اقساط و ثبت درخواست به‌صورت تلفنی و آنلاین انجام می‌شود و فقط برای امضای قرارداد و تحویل خودرو مراجعه لازم است.",
  },
  {
    q: "مشاوره خرید اقساطی هزینه دارد؟",
    a: "خیر، مشاوره و محاسبه شرایط اقساط کاملاً رایگان است و تا پیش از امضای قرارداد هیچ تعهدی برای شما ایجاد نمی‌کند.",
  },
]

export default function ContactPage() {
  return (
    <main id="main" className="flex-1">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbSchema(crumbs),
            {
              "@type": "ContactPage",
              name: title,
              description,
              url: absoluteUrl("/contact"),
              mainEntity: { "@id": orgId },
            },
            {
              "@type": "AutoDealer",
              "@id": orgId,
              name: siteConfig.name,
              url: absoluteUrl("/"),
              telephone: siteConfig.phone,
              email: siteConfig.email,
              openingHours: siteConfig.openingHours,
              address: {
                "@type": "PostalAddress",
                streetAddress: siteConfig.address.street,
                addressLocality: siteConfig.address.city,
                addressCountry: siteConfig.address.country,
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "sales",
                telephone: siteConfig.phone,
                email: siteConfig.email,
                availableLanguage: "fa",
                areaServed: "IR",
              },
            },
            faqSchema(faqs),
          ],
        }}
      />

      <section aria-labelledby="contact-heading" className="bg-muted/50 border-b">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <PageBreadcrumb items={crumbs} />
          <h1 id="contact-heading" className="mt-8 text-3xl font-black sm:text-4xl">
            تماس با خودرو قسطی
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
            برای مشاوره رایگان خرید اقساطی خودرو، محاسبه قسط یا پیگیری درخواستتان با ما در تماس باشید. می‌توانید
            تماس بگیرید یا فرم زیر را پر کنید تا کارشناسان ما با شما تماس بگیرند.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="form-heading" className="bg-card rounded-2xl border p-5 sm:p-8">
          <h2 id="form-heading" className="text-xl font-extrabold">
            ارسال پیام و درخواست مشاوره
          </h2>
          <p className="text-muted-foreground mt-2 mb-6 text-sm leading-6">
            فیلدهای ستاره‌دار الزامی هستند. شماره موبایل شما فقط برای پاسخ به همین پیام استفاده می‌شود.
          </p>
          <ContactForm />
        </section>

        <aside aria-labelledby="channels-heading" className="grid content-start gap-4">
          <h2 id="channels-heading" className="sr-only">
            راه‌های ارتباطی
          </h2>
          <address className="grid gap-3 not-italic">
            {channels.map((item) => {
              const body = (
                <>
                  <span className="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="text-muted-foreground block text-xs">{item.title}</span>
                    <span className="mt-0.5 block font-bold break-words">{item.value}</span>
                  </span>
                </>
              )
              const className = "bg-card flex items-center gap-4 rounded-2xl border p-4"
              return item.href ? (
                <a
                  key={item.title}
                  href={item.href}
                  className={`${className} hover:border-primary/40 focus-visible:ring-ring/50 transition-colors outline-none focus-visible:ring-[3px]`}
                >
                  {body}
                </a>
              ) : (
                <div key={item.title} className={className}>
                  {body}
                </div>
              )
            })}
          </address>
          <div className="bg-primary text-primary-foreground rounded-2xl p-5">
            <p className="font-extrabold">قبل از تماس، قسطتان را حساب کنید</p>
            <p className="mt-2 text-sm leading-6 opacity-90">
              قیمت و قسط ماهانه همه خودروها در صفحه هر برند آمده است.
            </p>
            <Link
              href="/brands"
              className="bg-background text-foreground mt-4 inline-flex h-9 items-center rounded-md px-4 text-sm font-bold"
            >
              مشاهده برندها و قیمت اقساط
            </Link>
          </div>
        </aside>
      </div>

      <section aria-labelledby="contact-faq-heading" className="mx-auto max-w-3xl px-4 pb-20">
        <h2 id="contact-faq-heading" className="text-center text-2xl font-extrabold">
          سوالات متداول درباره تماس و مشاوره
        </h2>
        <Accordion dir="rtl" type="single" collapsible className="mt-8">
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
    </main>
  )
}
