"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CarFront,
  ExternalLink,
  HelpCircle,
  ImagePlus,
  Plus,
  Save,
  Trash2,
} from "lucide-react"

import {
  Counter,
  DeleteButton,
  FormAlert,
  ImagePicker,
  RobotsCard,
  SeoFields,
  SwitchRow,
  useEditorShortcuts,
} from "@/components/admin/form-parts"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AdminBrand, AdminBrandInput } from "@/lib/admin-api"
import { brandPath } from "@/lib/catalog-paths"
import { faDate } from "@/lib/format"
import { siteConfig } from "@/lib/site"
import { SLUG_PATTERN, slugify } from "@/lib/slug"

import { deleteBrand, saveBrand } from "../../catalog-actions"

const EMPTY: AdminBrandInput = {
  name: "",
  slug: "",
  englishName: "",
  intro: "",
  content: "",
  logoUrl: null,
  color: "#1d4ed8",
  faqs: [],
  metaTitle: "",
  metaDescription: "",
  robotsIndex: true,
  robotsFollow: true,
  isActive: true,
  showOnHome: false,
  position: 0,
}

// Only the editable fields, in a fixed key order so dirty checks compare cleanly
// (jsonb reorders object keys, so FAQs are rebuilt as {q, a})
const toInput = (brand: AdminBrand): AdminBrandInput => ({
  ...(Object.fromEntries(Object.keys(EMPTY).map((key) => [key, brand[key as keyof AdminBrandInput]])) as AdminBrandInput),
  faqs: brand.faqs.map(({ q, a }) => ({ q, a })),
})

export function BrandEditor({ brand, carCount }: { brand: AdminBrand | null; carCount: number }) {
  const router = useRouter()
  const initial = React.useMemo(() => (brand ? toInput(brand) : EMPTY), [brand])
  const [form, setForm] = React.useState<AdminBrandInput>(initial)
  const [saved, setSaved] = React.useState(() => JSON.stringify(initial))
  const [slugTouched, setSlugTouched] = React.useState(!!brand)
  const [errors, setErrors] = React.useState<string[]>([])
  const [notice, setNotice] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const topBarRef = React.useRef<HTMLDivElement>(null)

  // Keep the content editor toolbar pinned just below the (possibly wrapping) top bar
  React.useEffect(() => {
    const bar = topBarRef.current
    if (!bar) return
    const observer = new ResizeObserver(() => {
      rootRef.current?.style.setProperty("--editor-toolbar-top", `${bar.offsetHeight}px`)
    })
    observer.observe(bar)
    return () => observer.disconnect()
  }, [])

  const dirty = JSON.stringify(form) !== saved
  const update = (value: Partial<AdminBrandInput>) => {
    setForm((f) => ({ ...f, ...value }))
    setNotice(null)
  }

  const save = React.useCallback(() => {
    const problems: string[] = []
    if (!form.name.trim()) problems.push("نام برند را وارد کنید")
    if (!SLUG_PATTERN.test(form.slug)) problems.push("نامک معتبر نیست (حروف کوچک انگلیسی/فارسی، عدد و خط تیره)")
    if (form.faqs.some((f) => !f.q.trim() || !f.a.trim())) problems.push("سؤال و پاسخ همه سوالات متداول را کامل کنید")
    setErrors(problems)
    if (problems.length) return

    startTransition(async () => {
      const result = await saveBrand(brand?.id ?? null, form)
      if (!result.ok) {
        setErrors(result.errors)
        return
      }
      const next = toInput(result.data)
      setForm(next)
      setSaved(JSON.stringify(next))
      setErrors([])
      setNotice("برند ذخیره شد و صفحه آن در سایت به‌روز شد.")
      if (!brand) router.replace(`/admin/brands/${result.data.id}`)
      else router.refresh()
    })
  }, [form, brand, router])

  useEditorShortcuts(dirty, save, pending)

  const defaultTitle = `خرید اقساطی ${form.name || "نام برند"}؛ قیمت و شرایط اقساط | ${siteConfig.name}`

  return (
    <div ref={rootRef} className="mx-auto max-w-7xl">
      <div
        ref={topBarRef}
        className="bg-background/95 sticky top-0 z-20 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur md:-mx-8 md:px-8"
      >
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/brands" aria-label="بازگشت به برندها">
              <ArrowRight />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold">{brand ? `ویرایش برند ${brand.name}` : "برند جدید"}</h1>
            <p className="text-muted-foreground text-xs">
              {dirty ? "تغییرات ذخیره‌نشده" : brand ? `آخرین ذخیره: ${faDate(brand.updatedAt)}` : "هنوز ذخیره نشده"}
              {" · "}Ctrl+S برای ذخیره
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {brand?.isActive && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={brandPath(brand.slug)} target="_blank">
                <ExternalLink aria-hidden="true" />
                مشاهده صفحه
              </Link>
            </Button>
          )}
          <Button size="sm" disabled={pending || (!dirty && !!brand)} onClick={save}>
            <Save aria-hidden="true" />
            {pending ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </div>

      <FormAlert errors={errors} notice={notice} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 content-start gap-6">
          <Card>
            <CardContent className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="brand-name">نام برند</Label>
                  <Input
                    id="brand-name"
                    value={form.name}
                    maxLength={80}
                    placeholder="مثلاً: ایران‌خودرو"
                    className="font-bold"
                    onChange={(e) => {
                      const name = e.target.value
                      update({ name, ...(slugTouched ? {} : { slug: slugify(form.englishName || name) }) })
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="brand-en">نام انگلیسی (اختیاری)</Label>
                  <Input
                    id="brand-en"
                    dir="ltr"
                    value={form.englishName}
                    maxLength={80}
                    placeholder="Iran Khodro"
                    onChange={(e) => {
                      const englishName = e.target.value
                      update({ englishName, ...(slugTouched ? {} : { slug: slugify(englishName || form.name) }) })
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand-slug">نامک (آدرس صفحه)</Label>
                <div className="focus-within:ring-ring/50 flex items-center overflow-hidden rounded-md border focus-within:ring-[3px]" dir="ltr">
                  <span className="bg-muted text-muted-foreground border-r px-3 py-2 text-xs whitespace-nowrap">/brands/</span>
                  <input
                    id="brand-slug"
                    value={form.slug}
                    maxLength={100}
                    dir="auto"
                    className="h-9 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                    onChange={(e) => {
                      setSlugTouched(true)
                      update({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                    }}
                  />
                </div>
                <p className="text-muted-foreground text-xs">بهتر است انگلیسی و کوتاه باشد، مثل iran-khodro</p>
                {form.slug && !SLUG_PATTERN.test(form.slug) && (
                  <p className="text-destructive text-xs">فقط حروف کوچک انگلیسی، حروف فارسی، عدد و خط تیره مجاز است.</p>
                )}
                {brand?.isActive && form.slug !== brand.slug && (
                  <p className="flex items-center gap-1 text-xs text-amber-700">
                    <AlertTriangle className="size-3.5" />
                    تغییر نامک، لینک‌های قبلی و رتبه گوگل این صفحه را از بین می‌برد.
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand-intro">معرفی کوتاه</Label>
                <Textarea
                  id="brand-intro"
                  value={form.intro}
                  maxLength={400}
                  rows={3}
                  placeholder="یکی دو جمله زیر عنوان صفحه برند؛ کلمه «خرید اقساطی» و نام برند را در آن بیاورید"
                  onChange={(e) => update({ intro: e.target.value })}
                />
                <Counter value={form.intro.length} max={400} ideal={[100, 200]} />
              </div>
            </CardContent>
          </Card>

          <section aria-labelledby="content-heading" className="grid gap-3">
            <div>
              <h2 id="content-heading" className="font-bold">متن معرفی برند</h2>
              <p className="text-muted-foreground text-xs">
                زیر لیست خودروها نمایش داده می‌شود؛ برای سئو، از تیترهای H2 و H3 و متن کامل درباره خرید اقساطی این برند استفاده کنید.
              </p>
            </div>
            <RichTextEditor value={form.content} onChange={(content) => update({ content })} />
          </section>

          <FaqCard faqs={form.faqs} onChange={(faqs) => update({ faqs })} brandName={form.name} />

          <SeoFields
            path={["brands", form.slug]}
            title={form.metaTitle}
            description={form.metaDescription}
            fallbackTitle={defaultTitle}
            fallbackDescription={form.intro}
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
                id="brand-active"
                checked={form.isActive}
                onChange={(isActive) => update({ isActive })}
                label="نمایش در سایت"
                description="خاموش = صفحه برند و خودروهایش در سایت نمایش داده نمی‌شوند."
              />
              <SwitchRow
                id="brand-home"
                checked={form.showOnHome}
                onChange={(showOnHome) => update({ showOnHome })}
                label="نمایش در صفحه اصلی"
                description="برند در بخش برندهای صفحه اصلی (به ترتیب نمایش) دیده می‌شود."
              />
              <div className="grid gap-2">
                <Label htmlFor="brand-position">ترتیب نمایش</Label>
                <Input
                  id="brand-position"
                  type="number"
                  min={0}
                  max={10000}
                  dir="ltr"
                  value={form.position}
                  onChange={(e) => update({ position: Math.max(0, Math.trunc(Number(e.target.value) || 0)) })}
                />
                <p className="text-muted-foreground text-xs">عدد کوچک‌تر = جلوتر در لیست برندها</p>
              </div>
              {brand && (
                <div className="flex items-center justify-between border-t pt-4">
                  <Link href={`/admin/cars?brand=${brand.id}`} className="text-primary flex items-center gap-1 text-xs hover:underline">
                    <CarFront className="size-3.5" />
                    خودروهای این برند
                  </Link>
                  <DeleteButton
                    withText
                    label={`حذف ${brand.name}`}
                    confirmText={
                      carCount
                        ? `این برند ${carCount} خودرو دارد و تا وقتی خودرو دارد حذف نمی‌شود. ادامه می‌دهید؟`
                        : `برند «${brand.name}» حذف شود؟`
                    }
                    action={() => deleteBrand(brand.id)}
                    redirectTo="/admin/brands"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <RobotsCard index={form.robotsIndex} follow={form.robotsFollow} subject="صفحه این برند" onChange={update} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImagePlus className="text-primary size-4" />
                لوگو و رنگ
              </CardTitle>
              <CardDescription>بدون لوگو، حرف اول نام برند روی رنگ برند نمایش داده می‌شود.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <ImagePicker
                value={form.logoUrl}
                onChange={(logoUrl) => update({ logoUrl })}
                label="لوگوی برند"
                aspect="aspect-square max-h-40"
                fit="object-contain"
              />
              <div className="grid gap-2">
                <Label htmlFor="brand-color">رنگ برند</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    aria-label="انتخاب رنگ برند"
                    value={form.color}
                    onChange={(e) => update({ color: e.target.value })}
                    className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
                  />
                  <Input id="brand-color" dir="ltr" value={form.color} maxLength={7} onChange={(e) => update({ color: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function FaqCard({
  faqs,
  onChange,
  brandName,
}: {
  faqs: AdminBrandInput["faqs"]
  onChange: (faqs: AdminBrandInput["faqs"]) => void
  brandName: string
}) {
  const edit = (index: number, value: Partial<{ q: string; a: string }>) =>
    onChange(faqs.map((faq, i) => (i === index ? { ...faq, ...value } : faq)))
  const move = (index: number, offset: number) => {
    const next = [...faqs]
    ;[next[index], next[index + offset]] = [next[index + offset], next[index]]
    onChange(next)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HelpCircle className="text-primary size-4" />
          سوالات متداول
        </CardTitle>
        <CardDescription>
          با اسکیمای FAQPage در صفحه برند نمایش داده می‌شود. اگر خالی بماند، سوالات پیش‌فرض با قیمت و قسط واقعی خودروهای
          {brandName ? ` ${brandName}` : " این برند"} ساخته می‌شود.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {faqs.map((faq, i) => (
          <fieldset key={i} className="grid gap-2 rounded-lg border p-3">
            <legend className="sr-only">سؤال {i + 1}</legend>
            <div className="flex items-center gap-1">
              <Input
                value={faq.q}
                maxLength={200}
                placeholder="سؤال"
                aria-label={`سؤال ${i + 1}`}
                className="font-medium"
                onChange={(e) => edit(i, { q: e.target.value })}
              />
              <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label="انتقال به بالا" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label="انتقال به پایین" disabled={i === faqs.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive size-8 shrink-0"
                aria-label={`حذف سؤال ${i + 1}`}
                onClick={() => onChange(faqs.filter((_, j) => j !== i))}
              >
                <Trash2 />
              </Button>
            </div>
            <Textarea
              value={faq.a}
              maxLength={1000}
              rows={2}
              placeholder="پاسخ"
              aria-label={`پاسخ سؤال ${i + 1}`}
              onChange={(e) => edit(i, { a: e.target.value })}
            />
          </fieldset>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          disabled={faqs.length >= 20}
          onClick={() => onChange([...faqs, { q: "", a: "" }])}
        >
          <Plus aria-hidden="true" />
          افزودن سؤال
        </Button>
      </CardContent>
    </Card>
  )
}
