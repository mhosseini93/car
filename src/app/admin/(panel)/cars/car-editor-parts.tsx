"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowDown, ArrowUp, Images, ListPlus, ListTree, Plus, Trash2, Wand2 } from "lucide-react"

import { ImagePicker } from "@/components/admin/form-parts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CarImage, CarInstallment, CarSpec } from "@/lib/catalog"
import { fa, installmentPlans, toman } from "@/lib/format"

const MAX_GALLERY = 20

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

// ------------------------------------------------------------ Gallery

export function GalleryCard({
  images,
  carName,
  onChange,
}: {
  images: CarImage[]
  carName: string
  onChange: (images: CarImage[]) => void
}) {
  const set = (i: number, value: Partial<CarImage>) =>
    onChange(images.map((image, j) => (j === i ? { ...image, ...value } : image)))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Images className="text-primary size-4" />
          گالری صفحه خودرو
        </CardTitle>
        <CardDescription>
          اولین تصویر، تصویر اصلی صفحه خودرو است. اگر گالری خالی باشد، «تصویر خودرو» نمایش داده می‌شود.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {images.length > 0 && (
          <ul className="grid gap-3">
            {images.map((image, i) => (
              <li key={`${image.src}-${i}`} className="flex items-start gap-3 rounded-lg border p-2">
                <div className="bg-muted relative h-16 w-24 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    sizes="96px"
                    unoptimized={!image.src.startsWith("/")}
                    className="object-contain"
                  />
                </div>
                <div className="grid min-w-0 flex-1 gap-1.5">
                  <Label htmlFor={`gallery-alt-${i}`} className="text-xs">
                    متن جایگزین تصویر {fa(i + 1)}
                    {i === 0 && <span className="text-primary"> (تصویر اصلی)</span>}
                  </Label>
                  <Input
                    id={`gallery-alt-${i}`}
                    value={image.alt}
                    maxLength={200}
                    placeholder={`مثلاً: نمای جلوی ${carName || "خودرو"}`}
                    onChange={(e) => set(i, { alt: e.target.value })}
                  />
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={i === 0}
                    aria-label={`انتقال تصویر ${fa(i + 1)} به بالا`}
                    onClick={() => onChange(move(images, i, i - 1))}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={i === images.length - 1}
                    aria-label={`انتقال تصویر ${fa(i + 1)} به پایین`}
                    onClick={() => onChange(move(images, i, i + 1))}
                  >
                    <ArrowDown />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive size-7 shrink-0"
                  aria-label={`حذف تصویر ${fa(i + 1)}`}
                  onClick={() => onChange(images.filter((_, j) => j !== i))}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {images.length < MAX_GALLERY && (
          // Kept empty: each finished upload is appended to the list
          <ImagePicker
            value={null}
            label="افزودن تصویر به گالری"
            aspect="aspect-[16/5]"
            fit="object-contain"
            onChange={(src) => src && onChange([...images, { src, alt: carName }])}
          />
        )}
      </CardContent>
    </Card>
  )
}

// ------------------------------------------------------------ Specs

// Edited as groups («مشخصات فنی»، «سیستم ترمز»…) but stored as one flat, ordered list
export function SpecsCard({ specs, onChange }: { specs: CarSpec[]; onChange: (specs: CarSpec[]) => void }) {
  const groups = [...new Set(specs.map((s) => s.group ?? ""))]
  const indexed = specs.map((spec, index) => ({ spec, index }))

  const set = (index: number, value: Partial<CarSpec>) =>
    onChange(specs.map((spec, i) => (i === index ? { ...spec, ...value } : spec)))
  const renameGroup = (from: string, to: string) =>
    onChange(specs.map((spec) => ((spec.group ?? "") === from ? { ...spec, group: to } : spec)))
  const addToGroup = (group: string) => {
    // Insert after the group's last row so groups stay together
    const last = specs.findLastIndex((s) => (s.group ?? "") === group)
    const next = [...specs]
    next.splice(last + 1, 0, { group, label: "", value: "" })
    onChange(next)
  }
  const addGroup = () => {
    let name = "گروه جدید"
    for (let n = 2; groups.includes(name); n++) name = `گروه جدید ${fa(n)}`
    onChange([...specs, { group: name, label: "", value: "" }])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ListTree className="text-primary size-4" />
          مشخصات فنی
        </CardTitle>
        <CardDescription>
          در صفحه خودرو به‌صورت جدول نمایش داده می‌شود. سال، وضعیت، گیربکس و سوخت خودکار اضافه می‌شوند.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {groups.map((group, g) => {
          const rows = indexed.filter(({ spec }) => (spec.group ?? "") === group)
          return (
            <fieldset key={g} className="grid gap-2 rounded-lg border p-3">
              <legend className="sr-only">{group || "بدون گروه"}</legend>
              <div className="flex items-center gap-2">
                <Input
                  aria-label="عنوان گروه"
                  value={group}
                  maxLength={60}
                  placeholder="عنوان گروه (مثلاً سیستم ترمز)"
                  className="font-bold"
                  onChange={(e) => renameGroup(group, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0"
                  aria-label={`حذف گروه ${group || "بدون عنوان"}`}
                  onClick={() => onChange(specs.filter((s) => (s.group ?? "") !== group))}
                >
                  <Trash2 />
                </Button>
              </div>
              {rows.map(({ spec, index }) => (
                <div key={index} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-2">
                  <Input
                    aria-label="عنوان مشخصه"
                    value={spec.label}
                    maxLength={80}
                    placeholder="عنوان (مثلاً حجم موتور)"
                    onChange={(e) => set(index, { label: e.target.value })}
                  />
                  <Input
                    aria-label={`مقدار ${spec.label || "مشخصه"}`}
                    value={spec.value}
                    maxLength={200}
                    placeholder="مقدار (مثلاً ۱۶۰۰ سی‌سی)"
                    onChange={(e) => set(index, { value: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`حذف ${spec.label || "مشخصه"}`}
                    onClick={() => onChange(specs.filter((_, i) => i !== index))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" className="justify-self-start" onClick={() => addToGroup(group)}>
                <Plus aria-hidden="true" />
                مشخصه جدید در این گروه
              </Button>
            </fieldset>
          )
        })}
        <Button type="button" variant="outline" className="justify-self-start" onClick={addGroup}>
          <ListPlus aria-hidden="true" />
          گروه جدید
        </Button>
      </CardContent>
    </Card>
  )
}

// ------------------------------------------------------------ Installments

export function InstallmentsEditor({
  price,
  minDownPercent,
  installments,
  onChange,
}: {
  price: number
  minDownPercent: number
  installments: CarInstallment[]
  onChange: (installments: CarInstallment[]) => void
}) {
  const custom = installments.length > 0
  const plans = installmentPlans({ price, minDownPercent, installments })
  const set = (i: number, value: Partial<CarInstallment>) =>
    onChange(installments.map((row, j) => (j === i ? { ...row, ...value } : row)))
  const toInt = (value: string) => Math.max(0, Math.trunc(Number(value.replace(/[,،٬\s]/g, "")) || 0))

  if (!custom) {
    return (
      <div className="grid gap-3">
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <caption className="text-muted-foreground bg-muted/50 p-2 text-start text-xs">
              جدول اختصاصی ندارد؛ این برآورد با نرخ تقریبی در سایت نمایش داده می‌شود
            </caption>
            <thead className="text-muted-foreground text-xs">
              <tr className="border-b">
                <th scope="col" className="px-3 py-2 text-start font-medium">مدت</th>
                <th scope="col" className="px-3 py-2 text-start font-medium">قسط ماهانه</th>
                <th scope="col" className="px-3 py-2 text-start font-medium">مجموع پرداختی</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {plans.map((plan) => (
                <tr key={plan.months}>
                  <td className="px-3 py-2">{fa(plan.months)} ماه</td>
                  <td className="text-primary px-3 py-2 font-medium">{toman(plan.monthly)}</td>
                  <td className="text-muted-foreground px-3 py-2">{toman(plan.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button
          type="button"
          variant="outline"
          className="justify-self-start"
          disabled={!price}
          onClick={() => onChange(plans.map((p) => ({ months: p.months, amount: Math.round(p.monthly) })))}
        >
          <Wand2 aria-hidden="true" />
          ساخت جدول اقساط اختصاصی
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <p className="text-muted-foreground text-xs">
        مبلغ قسط هر طرح با حداقل پیش‌پرداخت ({fa(minDownPercent)}٪) در صفحه خودرو نمایش داده می‌شود.
      </p>
      <div className="grid gap-2">
        {installments.map((row, i) => (
          <div key={i} className="grid grid-cols-[6rem_minmax(0,1fr)_auto] items-center gap-2">
            <Input
              type="number"
              dir="ltr"
              min={1}
              max={120}
              aria-label={`تعداد ماه طرح ${fa(i + 1)}`}
              value={row.months || ""}
              onChange={(e) => set(i, { months: Math.min(120, toInt(e.target.value)) })}
            />
            <Input
              inputMode="numeric"
              dir="ltr"
              aria-label={`قسط ماهانه طرح ${fa(row.months)} ماهه (تومان)`}
              value={row.amount ? row.amount.toLocaleString("en-US") : ""}
              placeholder="قسط ماهانه به تومان"
              onChange={(e) => set(i, { amount: toInt(e.target.value) })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`حذف طرح ${fa(row.months)} ماهه`}
              onClick={() => onChange(installments.filter((_, j) => j !== i))}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">ستون اول: تعداد ماه — ستون دوم: قسط ماهانه به تومان</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={installments.length >= 24}
          onClick={() => onChange([...installments, { months: 0, amount: 0 }])}
        >
          <Plus aria-hidden="true" />
          طرح جدید
        </Button>
        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => onChange([])}>
          <Trash2 aria-hidden="true" />
          حذف جدول و استفاده از برآورد سایت
        </Button>
      </div>
    </div>
  )
}
