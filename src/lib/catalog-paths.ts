// Client-safe catalog helpers (no server caching APIs)
import { fa, faYear, lowestInstallment, million } from "@/lib/format"

export const CATALOG_TAG = "catalog"

export const brandPath = (slug: string) => `/brands/${encodeURIComponent(slug)}`

export const carPath = (slug: string) => `/cars/${encodeURIComponent(slug)}`

// Car page SEO text used when the admin leaves meta title/description empty
export const carDefaultTitle = (name: string) => `خرید اقساطی ${name}؛ قیمت و شرایط اقساط`

export function carDefaultDescription(car: Parameters<typeof lowestInstallment>[0] & { name: string; year: number }) {
  const low = lowestInstallment(car)
  return `خرید اقساطی ${car.name} مدل ${faYear(car.year)} با پیش‌پرداخت ${million(low.down)} تومان و قسط ${fa(low.months)} ماهه از ${million(low.monthly)} تومان؛ قیمت نقدی، مشخصات فنی و شرایط خرید.`
}

export const GEARBOXES = ["اتوماتیک", "دستی", "CVT", "دنده‌ای-اتوماتیک"]
export const FUELS = ["بنزین", "دوگانه‌سوز", "هیبرید", "برقی", "دیزل"]
