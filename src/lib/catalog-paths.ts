// Client-safe catalog helpers (no server caching APIs)
export const CATALOG_TAG = "catalog"

export const brandPath = (slug: string) => `/brands/${encodeURIComponent(slug)}`

export const GEARBOXES = ["اتوماتیک", "دستی", "CVT", "دنده‌ای-اتوماتیک"]
export const FUELS = ["بنزین", "دوگانه‌سوز", "هیبرید", "برقی", "دیزل"]
