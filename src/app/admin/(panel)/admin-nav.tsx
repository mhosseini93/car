"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, FolderTree, MessagesSquare, Settings } from "lucide-react"

import { cn } from "@/lib/utils"

const nav = [
  { href: "/admin/posts", label: "مقالات", icon: FileText },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { href: "/admin/comments", label: "دیدگاه‌ها", icon: MessagesSquare },
  { href: "/admin/settings", label: "تنظیمات عمومی", icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="منوی پنل" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
