import Link from "next/link"
import { Car, ExternalLink, LogOut, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"

import { logout } from "../actions"

const nav = [{ href: "/admin/settings", label: "تنظیمات عمومی", icon: Settings }]

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="bg-background border-b md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-l">
        <div className="flex h-16 items-center gap-2 px-5 font-extrabold">
          <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
            <Car className="size-4" aria-hidden="true" />
          </span>
          پنل مدیریت
        </div>
        <nav aria-label="منوی پنل" className="flex gap-1 px-3 pb-3 md:flex-col">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-primary/10 text-primary flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background flex h-16 items-center justify-end gap-2 border-b px-4 md:px-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" target="_blank">
              <ExternalLink aria-hidden="true" />
              مشاهده سایت
            </Link>
          </Button>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut aria-hidden="true" />
              خروج
            </Button>
          </form>
        </header>
        <main id="main" className="flex-1 px-4 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
