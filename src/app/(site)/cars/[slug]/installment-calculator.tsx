"use client"

import * as React from "react"

import { Slider } from "@/components/ui/slider"
import type { CarInstallment } from "@/lib/catalog"
import { fa, installmentPlans, million, toman } from "@/lib/format"
import { cn } from "@/lib/utils"

const MAX_DOWN_PERCENT = 80

// A car's own installment table fixes the down payment, so only the term is selectable;
// without one, the site estimate also lets the buyer raise the down payment
export function InstallmentCalculator({
  name,
  price,
  minDownPercent,
  installments,
}: {
  name: string
  price: number
  minDownPercent: number
  installments: CarInstallment[]
}) {
  const fixedDown = installments.length > 0
  const [downPercent, setDownPercent] = React.useState(minDownPercent)
  const plans = installmentPlans({ price, minDownPercent: downPercent, installments })
  const [months, setMonths] = React.useState(() => plans[plans.length - 1].months)
  const plan = plans.find((p) => p.months === months) ?? plans[plans.length - 1]
  const extra = plan.total - price

  return (
    <div className="bg-background rounded-2xl border p-5 shadow-sm sm:p-6">
      <p className="font-extrabold">محاسبه قسط {name}</p>

      {!fixedDown && minDownPercent < MAX_DOWN_PERCENT && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span>پیش‌پرداخت</span>
            <span className="font-bold">{fa(downPercent)}٪</span>
          </div>
          <Slider
            className="mt-3"
            dir="rtl"
            min={minDownPercent}
            max={MAX_DOWN_PERCENT}
            step={5}
            value={[downPercent]}
            onValueChange={([value]) => setDownPercent(value)}
            aria-label="درصد پیش‌پرداخت"
          />
        </div>
      )}

      <fieldset className="mt-5">
        <legend className="text-sm">مدت بازپرداخت</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {plans.map((p) => (
            <label
              key={p.months}
              className={cn(
                "has-focus-visible:ring-ring/50 cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors has-focus-visible:ring-[3px]",
                p.months === plan.months ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
              )}
            >
              <input
                type="radio"
                name="installment-months"
                value={p.months}
                checked={p.months === plan.months}
                onChange={() => setMonths(p.months)}
                className="sr-only"
              />
              {fa(p.months)} ماهه
            </label>
          ))}
        </div>
      </fieldset>

      <dl className="mt-6 grid gap-3 text-sm" aria-live="polite">
        <div className="bg-primary/10 flex items-center justify-between rounded-xl p-4">
          <dt>قسط ماهانه</dt>
          <dd className="text-primary text-xl font-black">{toman(plan.monthly)}</dd>
        </div>
        <Row label={`پیش‌پرداخت (${fa(downPercent)}٪)`} value={toman(plan.down)} />
        <Row label="مجموع اقساط" value={toman(plan.monthly * plan.months)} />
        <Row label="مجموع پرداختی" value={toman(plan.total)} />
        {extra > 0 && <Row label="اختلاف با قیمت نقدی" value={`${million(extra)} تومان`} muted />}
      </dl>

      <p className="text-muted-foreground mt-4 text-xs leading-6">
        {plan.estimated
          ? "مبالغ بر اساس نرخ تقریبی محاسبه شده و قسط نهایی پس از اعتبارسنجی در قرارداد مشخص می‌شود."
          : "مبالغ بر اساس جدول اقساط فعلی این خودرو است و ممکن است با تغییر قیمت روز به‌روز شود."}
      </p>
    </div>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-bold", muted && "text-muted-foreground font-medium")}>{value}</dd>
    </div>
  )
}
