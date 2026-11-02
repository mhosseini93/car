import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { CarIllustration } from "@/components/home/car-illustration"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <CarIllustration color="#e5e7eb" className="w-56" />
      <p className="text-primary mt-8 text-6xl font-black">۴۰۴</p>
      <h1 className="mt-4 text-2xl font-extrabold">صفحه مورد نظر پیدا نشد</h1>
      <p className="text-muted-foreground mt-3 leading-7">
        ممکن است آدرس اشتباه وارد شده باشد یا این صفحه حذف شده باشد.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            بازگشت به صفحه اصلی
            <ArrowLeft aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/#cars">مشاهده خودروها</Link>
        </Button>
      </div>
    </main>
  )
}
