import { absoluteUrl, siteConfig } from "@/lib/site"

import { cars, faqs } from "./data"

const orgId = absoluteUrl("/#organization")

// Prices are stored in toman; schema.org expects an ISO currency (IRR = toman × 10)
const toRial = (toman: number) => toman * 10

export const homeStructuredData = {
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
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: siteConfig.name,
      url: absoluteUrl("/"),
      inLanguage: "fa-IR",
      publisher: { "@id": orgId },
    },
    {
      "@type": "ItemList",
      name: "خودروهای قابل خرید اقساطی",
      itemListElement: cars.map((car, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Car",
          name: car.name,
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
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
}
