import type { CSSProperties } from "react"
import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

import { Logo } from "@/components/layout/site-header"
import { siteConfig } from "@/lib/site"
import { getFooterSettings, type FooterLink } from "@/lib/site-settings"

export async function SiteFooter() {
  const { columns } = await getFooterSettings()

  return (
    <footer className="border-t">
      <div
        style={{ "--footer-cols": `1.4fr repeat(${columns.length}, 1fr) 1.2fr` } as CSSProperties}
        className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-(--footer-cols)"
      >
        <div>
          <Logo />
          <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-7">
            {siteConfig.name}، مرجع خرید اقساطی خودروی صفر و کارکرده با شرایط شفاف و بدون ضامن.
          </p>
        </div>
        {columns.map((column, i) => (
          <nav key={i} aria-labelledby={`footer-col-${i}`}>
            <h2 id={`footer-col-${i}`} className="font-bold">
              {column.title}
            </h2>
            <ul className="text-muted-foreground mt-4 grid gap-2 text-sm">
              {column.links.map((link, j) => (
                <li key={j}>
                  <FooterAnchor link={link} />
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <h2 className="font-bold">
            <Link href="/contact" className="hover:text-primary">
              تماس با ما
            </Link>
          </h2>
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
          <ul className="text-muted-foreground mt-4 flex gap-4 text-sm">
            <li>
              <Link href="/about" className="hover:text-foreground">
                درباره ما
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-foreground">
                فرم تماس و مشاوره
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-muted-foreground border-t py-6 text-center text-xs">
        © ۱۴۰۵ {siteConfig.name}. تمامی حقوق محفوظ است.
      </div>
    </footer>
  )
}

function FooterAnchor({ link }: { link: FooterLink }) {
  const className = "hover:text-foreground"

  if (link.href.startsWith("/") || link.href.startsWith("#")) {
    return (
      <Link href={link.href} className={className}>
        {link.label}
      </Link>
    )
  }

  const external = /^https?:\/\//.test(link.href)
  return (
    <a
      href={link.href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {link.label}
    </a>
  )
}
