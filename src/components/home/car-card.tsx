import { ArrowLeft, Cog, Fuel, Gauge } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { calcInstallment, fa, million } from "@/lib/format"

import { CarIllustration } from "./car-illustration"
import type { Car } from "./data"

export function CarCard({ car }: { car: Car }) {
  const { down, monthly } = calcInstallment(car.price, car.minDownPercent, 36)

  return (
    <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg">
      <article className="flex h-full flex-col" aria-labelledby={`car-${car.id}`}>
        <div className="from-muted to-background relative bg-linear-to-b px-6 pt-10 pb-4">
          <div className="absolute top-3 right-3 flex gap-1.5">
            <Badge variant={car.condition === "new" ? "default" : "secondary"}>
              {car.condition === "new" ? "صفر کیلومتر" : "کارکرده"}
            </Badge>
            {car.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-background">
                {tag}
              </Badge>
            ))}
          </div>
          <CarIllustration
            color={car.color}
            label={`تصویر ${car.name}`}
            className="w-full transition-transform duration-300 group-hover:-translate-x-2"
          />
        </div>

        <CardContent className="grid flex-1 gap-4 pt-5">
          <div className="flex items-baseline justify-between">
            <h3 id={`car-${car.id}`} className="text-lg font-bold">
              {car.name}
            </h3>
            <span className="text-muted-foreground text-sm">مدل {fa(car.year)}</span>
          </div>

          <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <li className="flex items-center gap-1">
              <Cog className="size-3.5" aria-hidden="true" /> گیربکس {car.gearbox}
            </li>
            <li className="flex items-center gap-1">
              <Fuel className="size-3.5" aria-hidden="true" /> {car.fuel}
            </li>
            <li className="flex items-center gap-1">
              <Gauge className="size-3.5" aria-hidden="true" />
              {car.mileage ? `${fa(car.mileage)} کیلومتر` : "صفر کیلومتر"}
            </li>
          </ul>

          <dl className="bg-muted/60 grid grid-cols-2 gap-3 rounded-lg p-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs">پیش‌پرداخت از</dt>
              <dd className="font-semibold">{million(down)} تومان</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">قسط ماهانه از</dt>
              <dd className="text-primary font-semibold">{million(monthly)} تومان</dd>
            </div>
          </dl>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-4 pb-5">
          <div>
            <p className="text-muted-foreground text-xs">قیمت نقدی</p>
            <p className="font-bold">{million(car.price)} تومان</p>
          </div>
          <Button variant="outline" size="sm" aria-label={`خرید قسطی ${car.name}`}>
            خرید قسطی
            <ArrowLeft aria-hidden="true" />
          </Button>
        </CardFooter>
      </article>
    </Card>
  )
}
