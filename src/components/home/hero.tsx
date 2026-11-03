import { ArrowLeft, ShieldCheck, Truck, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { calcInstallment, million } from "@/lib/format"

import type { Car } from "@/lib/catalog"

import { CarIllustration } from "./car-illustration"

const stats = [
  { value: "+۱۲٬۰۰۰", label: "خریدار راضی" },
  { value: "تا ۴۸ ماه", label: "مدت بازپرداخت" },
  { value: "۷۲ ساعته", label: "تحویل فوری" },
]

export function Hero({ cars }: { cars: Car[] }) {
  const minMonthly = cars.length
    ? Math.min(...cars.map((c) => calcInstallment(c.price, c.minDownPercent, 48).monthly))
    : null

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-slate-950 text-white"
    >
      {/* Background: grid texture + brand glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)] bg-size-[56px_56px]"
      />
      <div
        aria-hidden="true"
        className="bg-primary/50 absolute top-1/3 left-[10%] size-[36rem] -translate-y-1/2 rounded-full blur-[140px]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-slate-200">
            <ShieldCheck className="size-4 text-blue-400" aria-hidden="true" />
            بدون ضامن، فقط با چک صیادی
          </p>
          <h1
            id="hero-heading"
            className="mt-6 text-4xl leading-[1.3] font-black sm:text-5xl xl:text-6xl xl:leading-[1.25]"
          >
            خرید اقساطی خودرو
            <span className="block bg-linear-to-l from-blue-300 to-blue-500 bg-clip-text text-transparent">
              بدون ضامن و دردسر
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            <strong className="font-semibold text-white">خرید اقساطی خودرو</strong>ی صفر و
            کارکرده از برندهای معتبر، با پیش‌پرداخت از ۲۵٪، بازپرداخت تا ۴۸ ماه و تحویل
            فوری. همه مراحل آنلاین و بدون مراجعه حضوری.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild className="h-12 px-6 text-base">
              <a href="#popular">
                مشاهده خودروها
                <ArrowLeft aria-hidden="true" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 border-white/20 bg-white/5 px-6 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <a href="#brands">انتخاب برند</a>
            </Button>
          </div>

          <dl className="mt-12 flex max-w-md divide-x divide-x-reverse divide-white/10">
            {stats.map((s) => (
              <div key={s.label} className="flex-1 px-4 first:pr-0">
                <dt className="text-xs text-slate-400">{s.label}</dt>
                <dd className="mt-1 text-xl font-extrabold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Showcase */}
        <div className="relative mx-auto aspect-[5/4] w-full max-w-lg lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute inset-[10%] rounded-full bg-radial from-blue-500/25 via-blue-500/5 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-[6%] bottom-[20%] h-10 rounded-[100%] bg-blue-500/40 blur-2xl"
          />
          <CarIllustration
            color="#3b82f6"
            className="absolute inset-x-0 bottom-[16%] w-full drop-shadow-[0_30px_40px_rgb(37_99_235/0.35)]"
          />

          <div className="absolute top-[6%] right-0 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
            <p className="flex items-center gap-2 text-xs text-slate-300">
              <Wallet className="size-4 text-blue-400" aria-hidden="true" />
              قسط ماهانه از
            </p>
            <p className="mt-1 text-2xl font-black">
              {minMonthly === null ? "—" : million(minMonthly)} <span className="text-sm font-medium">تومان</span>
            </p>
          </div>

          <div className="absolute bottom-0 left-0 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 pe-5 shadow-2xl backdrop-blur-md">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Truck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold">تحویل ۷۲ ساعته</p>
              <p className="text-xs text-slate-400">برای خودروهای موجود</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
