import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { default: "پنل مدیریت", template: "%s | پنل مدیریت" },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-muted/40 flex min-h-screen flex-1 flex-col">{children}</div>
}
