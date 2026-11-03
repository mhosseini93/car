// Set NEXT_PUBLIC_SITE_URL to the real domain in production
export const siteConfig = {
  name: "خودرو قسطی",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, ""),
  title: "خرید اقساطی خودرو بدون ضامن | خودرو قسطی",
  description:
    "خرید اقساطی خودروی صفر و کارکرده بدون ضامن، با پیش‌پرداخت از ۲۵٪، اقساط ۱۲ تا ۴۸ ماهه و تحویل فوری. قسط ماهانه را آنلاین محاسبه کنید.",
  keywords: [
    "خرید اقساطی خودرو",
    "فروش اقساطی خودرو",
    "خودرو قسطی",
    "خرید خودرو بدون ضامن",
    "محاسبه اقساط خودرو",
  ],
  phone: "+982100000000",
  phoneDisplay: "۰۲۱-۰۰۰۰۰۰۰۰",
  email: "info@example.com",
  address: {
    street: "خیابان نمونه، پلاک ۱",
    city: "تهران",
    country: "IR",
  },
  themeColor: "#1d4ed8",
}

// Already-absolute URLs (e.g. imported images on another host) pass through unchanged
export const absoluteUrl = (path = "/") => (/^https?:\/\//.test(path) ? path : `${siteConfig.url}${path}`)

// Nested metadata objects replace (not merge with) the parent's, so pages that
// set openGraph should spread this in
export const baseOpenGraph = {
  type: "website",
  locale: "fa_IR",
  siteName: siteConfig.name,
} as const

// Child pages that override openGraph/twitter lose the root opengraph-image,
// so they pass this explicitly
export const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "خودرو قسطی؛ خرید اقساطی خودرو بدون ضامن",
}
