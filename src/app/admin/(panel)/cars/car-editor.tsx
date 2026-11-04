"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Calculator, ExternalLink, ImagePlus, Save, X } from "lucide-react"

import {
  DeleteButton,
  FormAlert,
  ImagePicker,
  RobotsCard,
  SeoFields,
  SwitchRow,
  useEditorShortcuts,
} from "@/components/admin/form-parts"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { CarIllustration } from "@/components/home/car-illustration"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AdminBrandRow, AdminCar, AdminCarInput } from "@/lib/admin-api"
import { carDefaultDescription, carDefaultTitle, carPath, FUELS, GEARBOXES } from "@/lib/catalog-paths"
import { faDate, lowestInstallment, toman } from "@/lib/format"
import { siteConfig } from "@/lib/site"
import { SLUG_PATTERN, slugify } from "@/lib/slug"
import { cn } from "@/lib/utils"

import { deleteCar, saveCar } from "../../catalog-actions"
import { GalleryCard, InstallmentsEditor, SpecsCard } from "./car-editor-parts"

const EMPTY: AdminCarInput = {
  name: "",
  slug: "",
  brandId: 0,
  year: 1405,
  condition: "new",
  mileage: 0,
  price: 0,
  minDownPercent: 30,
  gearbox: "اتوماتیک",
  fuel: "بنزین",
  color: "#e5e7eb",
  imageUrl: null,
  imageAlt: "",
  gallery: [],
  content: "",
  specs: [],
  installments: [],
  metaTitle: "",
  metaDescription: "",
  robotsIndex: true,
  robotsFollow: true,
  tags: [],
  showOnHome: false,
  isActive: true,
  position: 0,
}

const toInput = (car: AdminCar): AdminCarInput =>
  Object.fromEntries(Object.keys(EMPTY).map((key) => [key, car[key as keyof AdminCarInput]])) as AdminCarInput

const toInt = (value: string) => Math.max(0, Math.trunc(Number(value.replace(/[,،٬\s]/g, "")) || 0))

export function CarEditor({
  car,
  brands,
  defaultBrandId,
}: {
  car: AdminCar | null
  brands: AdminBrandRow[]
  defaultBrandId?: number
}) {
  const router = useRouter()
  const initial = React.useMemo(
    () => (car ? toInput(car) : { ...EMPTY, brandId: defaultBrandId ?? brands[0]?.id ?? 0 }),
    [car, brands, defaultBrandId]
  )
  const [form, setForm] = React.useState<AdminCarInput>(initial)
  const [saved, setSaved] = React.useState(() => JSON.stringify(initial))
  const [slugTouched, setSlugTouched] = React.useState(!!car)
  const [tagDraft, setTagDraft] = React.useState("")
  const [errors, setErrors] = React.useState<string[]>([])
  const [notice, setNotice] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  const dirty = JSON.stringify(form) !== saved
  const update = (value: Partial<AdminCarInput>) => {
    setForm((f) => ({ ...f, ...value }))
    setNotice(null)
  }
  const brand = brands.find((b) => b.id === form.brandId)

  const save = React.useCallback(() => {
    const problems: string[] = []
    if (!form.name.trim()) problems.push("نام خودرو را وارد کنید")
    if (!SLUG_PATTERN.test(form.slug)) problems.push("نامک معتبر نیست (حروف کوچک انگلیسی/فارسی، عدد و خط تیره)")
    if (!form.brandId) problems.push("برند را انتخاب کنید")
    if (form.price < 1_000_000) problems.push("قیمت نقدی را به تومان وارد کنید")
    if (form.imageUrl && !form.imageAlt.trim()) problems.push("برای تصویر خودرو متن جایگزین (alt) بنویسید")
    if (form.gallery.some((image) => !image.alt.trim())) problems.push("برای همه تصاویر گالری متن جایگزین (alt) بنویسید")
    if (form.specs.some((spec) => !spec.label.trim() || !spec.value.trim()))
      problems.push("عنوان و مقدار همه مشخصات فنی را پر کنید یا ردیف‌های خالی را حذف کنید")
    if (form.installments.some((row) => !row.months || !row.amount))
      problems.push("تعداد ماه و مبلغ همه طرح‌های اقساط را پر کنید")
    if (new Set(form.installments.map((row) => row.months)).size !== form.installments.length)
      problems.push("هر مدت بازپرداخت فقط یک بار در جدول اقساط بیاید")
    setErrors(problems)
    if (problems.length) return

    startTransition(async () => {
      const result = await saveCar(car?.id ?? null, form)
      if (!result.ok) {
        setErrors(result.errors)
        return
      }
      const next = toInput(result.data)
      setForm(next)
      setSaved(JSON.stringify(next))
      setErrors([])
      setNotice("خودرو ذخیره شد و در سایت به‌روز شد.")
      if (!car) router.replace(`/admin/cars/${result.data.id}`)
      else router.refresh()
    })
  }, [form, car, router])

  useEditorShortcuts(dirty, save, pending)

  const addTag = () => {
    const tag = tagDraft.trim()
    if (tag && !form.tags.includes(tag) && form.tags.length < 5) update({ tags: [...form.tags, tag] })
    setTagDraft("")
  }

  if (!brands.length) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-dashed p-10 text-center">
        <p className="text-muted-foreground">برای ثبت خودرو اول باید یک برند بسازید.</p>
        <Button className="mt-4" asChild>
          <Link href="/admin/brands/new">ساخت برند</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="bg-background/95 sticky top-0 z-20 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/cars" aria-label="بازگشت به خودروها">
              <ArrowRight />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold">{car ? `ویرایش ${car.name}` : "خودروی جدید"}</h1>
            <p className="text-muted-foreground text-xs">
              {dirty ? "تغییرات ذخیره‌نشده" : car ? `آخرین ذخیره: ${faDate(car.updatedAt)}` : "هنوز ذخیره نشده"}
              {" · "}Ctrl+S برای ذخیره
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {car?.isActive && brand?.isActive && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={carPath(car.slug)} target="_blank">
                <ExternalLink aria-hidden="true" />
                مشاهده صفحه خودرو
              </Link>
            </Button>
          )}
          <Button size="sm" disabled={pending || (!dirty && !!car)} onClick={save}>
            <Save aria-hidden="true" />
            {pending ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </div>

      <FormAlert errors={errors} notice={notice} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid min-w-0 content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">مشخصات خودرو</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="car-name">نام خودرو</Label>
                <Input
                  id="car-name"
                  value={form.name}
                  maxLength={100}
                  placeholder="مثلاً: پژو ۲۰۷ اتوماتیک"
                  className="h-11 text-base font-bold"
                  onChange={(e) => {
                    const name = e.target.value
                    update({ name, ...(slugTouched ? {} : { slug: slugify(name) }) })
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="car-slug">نامک (شناسه انگلیسی)</Label>
                <Input
                  id="car-slug"
                  dir="ltr"
                  value={form.slug}
                  maxLength={120}
                  placeholder="peugeot-207-at"
                  onChange={(e) => {
                    setSlugTouched(true)
                    update({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                  }}
                />
                {form.slug && !SLUG_PATTERN.test(form.slug) && (
                  <p className="text-destructive text-xs">فقط حروف کوچک، عدد و خط تیره مجاز است.</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="car-brand">برند</Label>
                <select
                  id="car-brand"
                  value={form.brandId}
                  onChange={(e) => update({ brandId: Number(e.target.value) })}
                  className="border-input bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                      {b.isActive ? "" : " (غیرفعال)"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="car-year">سال ساخت (مدل)</Label>
                <Input
                  id="car-year"
                  type="number"
                  dir="ltr"
                  min={1300}
                  max={2100}
                  value={form.year}
                  onChange={(e) => update({ year: toInt(e.target.value) })}
                />
              </div>
              <fieldset className="grid gap-2">
                <legend className="mb-2 text-sm font-medium">وضعیت</legend>
                <div className="bg-muted flex gap-1 rounded-lg p-1">
                  {(["new", "used"] as const).map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      aria-pressed={form.condition === condition}
                      onClick={() => update({ condition, mileage: condition === "new" ? 0 : form.mileage })}
                      className={cn(
                        "flex-1 rounded-md py-1.5 text-sm font-medium transition-colors",
                        form.condition === condition ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {condition === "new" ? "صفر کیلومتر" : "کارکرده"}
                    </button>
                  ))}
                </div>
              </fieldset>
              {form.condition === "used" && (
                <div className="grid gap-2">
                  <Label htmlFor="car-mileage">کارکرد (کیلومتر)</Label>
                  <Input
                    id="car-mileage"
                    type="number"
                    dir="ltr"
                    min={0}
                    value={form.mileage}
                    onChange={(e) => update({ mileage: toInt(e.target.value) })}
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="car-gearbox">گیربکس</Label>
                <Input id="car-gearbox" list="gearbox-options" value={form.gearbox} maxLength={30} onChange={(e) => update({ gearbox: e.target.value })} />
                <datalist id="gearbox-options">
                  {GEARBOXES.map((g) => <option key={g} value={g} />)}
                </datalist>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="car-fuel">سوخت</Label>
                <Input id="car-fuel" list="fuel-options" value={form.fuel} maxLength={30} onChange={(e) => update({ fuel: e.target.value })} />
                <datalist id="fuel-options">
                  {FUELS.map((f) => <option key={f} value={f} />)}
                </datalist>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="car-tag">برچسب‌ها (حداکثر ۵)</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {form.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="gap-1 py-1">
                      {tag}
                      <button
                        type="button"
                        aria-label={`حذف برچسب ${tag}`}
                        className="hover:text-destructive"
                        onClick={() => update({ tags: form.tags.filter((t) => t !== tag) })}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                  <Input
                    id="car-tag"
                    value={tagDraft}
                    maxLength={30}
                    disabled={form.tags.length >= 5}
                    placeholder="مثلاً: تحویل فوری — Enter"
                    className="w-56"
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    onBlur={addTag}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <PriceCard form={form} update={update} />

          <GalleryCard images={form.gallery} carName={form.name} onChange={(gallery) => update({ gallery })} />

          <SpecsCard specs={form.specs} onChange={(specs) => update({ specs })} />

          <section aria-labelledby="content-heading" className="grid gap-3">
            <div>
              <h2 id="content-heading" className="font-bold">بررسی و توضیحات خودرو</h2>
              <p className="text-muted-foreground text-xs">
                بعد از مشخصات فنی در صفحه خودرو نمایش داده می‌شود؛ برای سئو از تیترهای H2 و H3 استفاده کنید.
              </p>
            </div>
            <RichTextEditor value={form.content} onChange={(content) => update({ content })} />
          </section>

          <SeoFields
            path={["cars", form.slug]}
            title={form.metaTitle}
            description={form.metaDescription}
            fallbackTitle={`${carDefaultTitle(form.name || "خودرو")} | ${siteConfig.name}`}
            fallbackDescription={form.price ? carDefaultDescription({ ...form, name: form.name || "خودرو" }) : ""}
            onChange={update}
          />
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">نمایش</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <SwitchRow
                id="car-active"
                checked={form.isActive}
                onChange={(isActive) => update({ isActive })}
                label="نمایش در سایت"
                description={brand && !brand.isActive ? "برند این خودرو غیرفعال است؛ تا فعال نشود خودرو هم نمایش داده نمی‌شود." : undefined}
              />
              <SwitchRow
                id="car-home"
                checked={form.showOnHome}
                onChange={(showOnHome) => update({ showOnHome })}
                label="نمایش در پرمخاطب‌ترین‌های صفحه اصلی"
                description="حداکثر ۸ خودرو، به ترتیب «ترتیب نمایش»، در صفحه اصلی دیده می‌شوند."
              />
              <div className="grid gap-2">
                <Label htmlFor="car-position">ترتیب نمایش</Label>
                <Input id="car-position" type="number" dir="ltr" min={0} value={form.position} onChange={(e) => update({ position: toInt(e.target.value) })} />
                <p className="text-muted-foreground text-xs">عدد کوچک‌تر = جلوتر</p>
              </div>
              {car && (
                <div className="flex justify-end border-t pt-4">
                  <DeleteButton
                    withText
                    label={`حذف ${car.name}`}
                    confirmText={`خودروی «${car.name}» برای همیشه حذف شود؟`}
                    action={() => deleteCar(car.id)}
                    redirectTo="/admin/cars"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <RobotsCard index={form.robotsIndex} follow={form.robotsFollow} subject="صفحه این خودرو" onChange={update} />

          {car?.sourceUrl && (
            <p className="text-muted-foreground rounded-lg border p-3 text-xs leading-6">
              این خودرو از{" "}
              <a href={car.sourceUrl} target="_blank" rel="noreferrer" className="text-primary break-all hover:underline" dir="ltr">
                {car.sourceUrl}
              </a>{" "}
              وارد شده است. اجرای دوباره ورود داده، قیمت، مشخصات و اقساط را از همان‌جا به‌روز می‌کند.
            </p>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImagePlus className="text-primary size-4" />
                تصویر خودرو
              </CardTitle>
              <CardDescription>ترجیحاً PNG یا WebP بدون پس‌زمینه، نمای بغل. بدون تصویر، طرح خودرو با رنگ انتخابی نمایش داده می‌شود.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <ImagePicker value={form.imageUrl} onChange={(imageUrl) => update({ imageUrl })} label="تصویر خودرو" aspect="aspect-[12/5]" fit="object-contain" />
              {form.imageUrl ? (
                <div className="grid gap-2">
                  <Label htmlFor="car-alt">متن جایگزین (alt)</Label>
                  <Input
                    id="car-alt"
                    value={form.imageAlt}
                    maxLength={200}
                    placeholder={`مثلاً: نمای جانبی ${form.name || "خودرو"} سفید`}
                    onChange={(e) => update({ imageAlt: e.target.value })}
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="car-color">رنگ طرح خودرو</Label>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <CarIllustration color={form.color} className="w-full" />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      aria-label="انتخاب رنگ خودرو"
                      value={form.color}
                      onChange={(e) => update({ color: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
                    />
                    <Input id="car-color" dir="ltr" value={form.color} maxLength={7} onChange={(e) => update({ color: e.target.value })} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PriceCard({ form, update }: { form: AdminCarInput; update: (value: Partial<AdminCarInput>) => void }) {
  const low = lowestInstallment(form)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="text-primary size-4" />
          قیمت و اقساط
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="car-price">قیمت نقدی (تومان)</Label>
            <Input
              id="car-price"
              inputMode="numeric"
              dir="ltr"
              value={form.price ? form.price.toLocaleString("en-US") : ""}
              placeholder="1,450,000,000"
              onChange={(e) => update({ price: toInt(e.target.value) })}
            />
            <p className="text-muted-foreground text-xs">{form.price ? toman(form.price) : "عدد را به تومان وارد کنید"}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="car-down">حداقل پیش‌پرداخت (درصد)</Label>
            <Input
              id="car-down"
              type="number"
              dir="ltr"
              min={0}
              max={90}
              value={form.minDownPercent}
              onChange={(e) => update({ minDownPercent: Math.min(90, toInt(e.target.value)) })}
            />
            <p className="text-muted-foreground text-xs">
              {form.price ? `${toman(low.down)} پیش‌پرداخت` : "—"}
            </p>
          </div>
        </div>
        <InstallmentsEditor
          price={form.price}
          minDownPercent={form.minDownPercent}
          installments={form.installments}
          onChange={(installments) => update({ installments })}
        />
      </CardContent>
    </Card>
  )
}
