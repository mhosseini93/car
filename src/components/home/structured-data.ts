import type { BrandSummary, Car } from "@/lib/catalog"
import { absoluteUrl, siteConfig } from "@/lib/site"

import { faqs } from "./data"

export const orgId = absoluteUrl("/#organization")

// Prices are stored in toman; schema.org expects an ISO currency (IRR = toman × 10)
const toRial = (toman: number) => toman * 10

export function carListSchema(name: string, list: Car[]) {
  return {
    "@type": "ItemList",
    name,
    itemListElement: list.map((car, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Car",
        name: car.name,
        brand: { "@type": "Brand", name: car.brand.name },
        ...(car.imageUrl ? { image: absoluteUrl(car.imageUrl) } : {}),
        modelDate: String(car.year),
        itemCondition:
          car.condition === "new"
            ? "https://schema.org/NewCondition"
            : "https://schema.org/UsedCondition",
        vehicleTransmission: car.gearbox,
        fuelType: car.fuel,
        mileageFromOdometer: {
          "@type": "QuantitativeValue",
          value: car.mileage ?? 0,
          unitCode: "KMT",
        },
        offers: {
          "@type": "Offer",
          price: toRial(car.price),
          priceCurrency: "IRR",
          availability: "https://schema.org/InStock",
          seller: { "@id": orgId },
        },
      },
    })),
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }
}

export const homeStructuredData = (brands: BrandSummary[], popularCars: Car[]) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AutoDealer",
      "@id": orgId,
      name: siteConfig.name,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/icon.svg"),
      image: absoluteUrl("/opengraph-image"),
      description: siteConfig.description,
      telephone: siteConfig.phone,
      email: siteConfig.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.address.street,
        addressLocality: siteConfig.address.city,
        addressCountry: siteConfig.address.country,
      },
      brand: brands.map((b) => ({ "@type": "Brand", name: b.name })),
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: siteConfig.name,
      url: absoluteUrl("/"),
      inLanguage: "fa-IR",
      publisher: { "@id": orgId },
    },
    carListSchema("پرمخاطب‌ترین خودروهای اقساطی", popularCars),
    faqSchema(faqs),
  ],
})
