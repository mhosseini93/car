import { cacheLife, cacheTag } from "next/cache"

import { api } from "@/lib/api"

export type FooterLink = { label: string; href: string }
export type FooterColumn = { title: string; links: FooterLink[] }
export type FooterSettings = { columns: FooterColumn[]; updatedAt: string | null }

export const SITE_SETTINGS_TAG = "site-settings"

// Shown if the backend is unreachable; mirrors the backend's defaults
const FALLBACK_FOOTER: FooterSettings = {
  updatedAt: null,
  columns: [
    {
      title: "برندها",
      links: [
        { label: "خرید اقساطی ایران‌خودرو", href: "/brands/iran-khodro" },
        { label: "خرید اقساطی سایپا", href: "/brands/saipa" },
        { label: "خرید اقساطی مدیران‌خودرو", href: "/brands/modiran-khodro" },
        { label: "خرید اقساطی کرمان موتور", href: "/brands/kerman-motor" },
        { label: "خرید اقساطی فونیکس", href: "/brands/fownix" },
        { label: "خرید اقساطی بهمن موتور", href: "/brands/bahman-motor" },
      ],
    },
    {
      title: "دسترسی سریع",
      links: [
        { label: "خودروهای پرمخاطب", href: "/#popular" },
        { label: "مراحل خرید", href: "/#steps" },
        { label: "سوالات متداول", href: "/#faq" },
      ],
    },
  ],
}

// Cached for all visitors; the admin save action expires it with updateTag
export async function getFooterSettings(): Promise<FooterSettings> {
  "use cache"
  cacheTag(SITE_SETTINGS_TAG)

  try {
    const settings = await api<FooterSettings>("/settings/footer")
    cacheLife("hours")
    return settings
  } catch {
    // Retry soon instead of pinning the fallback for hours
    cacheLife("minutes")
    return FALLBACK_FOOTER
  }
}
