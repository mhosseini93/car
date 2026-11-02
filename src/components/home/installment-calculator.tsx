"use client"

import * as React from "react"
import { ArrowLeft, Calculator } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ANNUAL_RATE, calcInstallment, fa, million } from "@/lib/format"

import { cars } from "./data"

const monthOptions = [12, 24, 36, 48]

export function InstallmentCalculator({ className }: { className?: string }) {
  const [carId, setCarId] = React.useState(cars[0].id)
  const [downPercent, setDownPercent] = React.useState(40)
  const [months, setMonths] = React.useState(24)

  const car = cars.find((c) => c.id === carId) ?? cars[0]
  const percent = Math.max(downPercent, car.minDownPercent)
  const { down, total, monthly } = calcInstallment(car.price, percent, months)

  return (
    <Card id="calculator" className={cn("scroll-mt-24 shadow-xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="text-primary size-5" aria-hidden="true" />
          محاسبه‌گر اقساط
        </CardTitle>
        <CardDescription>خودرو، پیش‌پرداخت و مدت بازپرداخت را انتخاب کنید.</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <div className="grid gap-2">
          <Label id="calc-car" asChild><span>خودرو</span></Label>
          <div role="group" aria-labelledby="calc-car" className="grid grid-cols-2 gap-2">
            {cars.slice(0, 4).map((c) => (
              <Button
                key={c.id}
                type="button"
                size="sm"
                variant={c.id === carId ? "default" : "outline"}
                aria-pressed={c.id === carId}
                onClick={() => setCarId(c.id)}
              >
                {c.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <Label id="calc-down" asChild><span>پیش‌پرداخت</span></Label>
            <span className="font-medium">
              {fa(percent)}٪ · {million(down)} تومان
            </span>
          </div>
          <Slider
            dir="rtl"
            aria-label="درصد پیش‌پرداخت"
            min={car.minDownPercent}
            max={70}
            step={5}
            value={[percent]}
            onValueChange={([v]) => setDownPercent(v)}
          />
        </div>

        <div className="grid gap-2">
          <Label id="calc-months" asChild><span>مدت بازپرداخت</span></Label>
          <Tabs dir="rtl" value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
            <TabsList aria-labelledby="calc-months" className="grid w-full grid-cols-4">
              {monthOptions.map((m) => (
                <TabsTrigger key={m} value={String(m)}>
                  {fa(m)} ماه
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div aria-live="polite" className="bg-primary text-primary-foreground rounded-xl p-4">
          <p className="text-sm opacity-80">قسط ماهانه</p>
          <p className="mt-1 text-3xl font-extrabold">
            {fa(monthly)} <span className="text-base font-medium">تومان</span>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/20 pt-3 text-sm">
            <div>
              <p className="opacity-70">قیمت خودرو</p>
              <p className="font-semibold">{million(car.price)} تومان</p>
            </div>
            <div>
              <p className="opacity-70">مجموع اقساط</p>
              <p className="font-semibold">{million(total)} تومان</p>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          برآورد تقریبی با سود سالانه {fa(ANNUAL_RATE * 100)}٪؛ مبلغ نهایی پس از اعتبارسنجی اعلام می‌شود.
        </p>
      </CardContent>

      <CardFooter>
        <Button size="lg" className="w-full">
          ثبت درخواست خرید
          <ArrowLeft aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  )
}
