"use client"

import * as React from "react"
import Link from "next/link"
import { Car, Menu, Phone, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/site"

const links = [
  { href: "/brands", label: "برندها" },
  { href: "/#popular", label: "پرمخاطب‌ها" },
  { href: "/#steps", label: "مراحل خرید" },
  { href: "/blog", label: "بلاگ" },
  { href: "/#faq", label: "سوالات متداول" },
  { href: "/contact", label: "تماس با ما" },
]

export function Logo() {
  return (
    <Link href="/" aria-label={`${siteConfig.name} - صفحه اصلی`} className="flex items-center gap-2 font-extrabold">
      <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-lg">
        <Car className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg">{siteConfig.name}</span>
    </Link>
  )
}

export function SiteHeader() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-3 focus:right-3"
      >
        پرش به محتوای اصلی
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav aria-label="منوی اصلی" className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-1.5 text-sm font-medium">
            <Phone className="text-primary size-4" aria-hidden="true" />
            <span dir="ltr">{siteConfig.phoneDisplay}</span>
          </a>
          <Button>ورود / ثبت‌نام</Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t md:hidden">
          <nav aria-label="منوی موبایل" className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="hover:bg-muted rounded-md px-3 py-2 text-sm"
              >
                {link.label}
              </Link>
            ))}
            <Button className="mt-2">ورود / ثبت‌نام</Button>
          </nav>
        </div>
      )}
    </header>
  )
}
