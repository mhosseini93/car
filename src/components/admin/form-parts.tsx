"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, AlertTriangle, Bot, CheckCircle2, Search, Trash2, X } from "lucide-react"

import { uploadFile } from "@/components/admin/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { fa } from "@/lib/format"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

// Shared building blocks for the admin editors

export function Counter({ value, max, ideal }: { value: number; max: number; ideal?: [number, number] }) {
  const good = ideal ? value >= ideal[0] && value <= ideal[1] : value <= max
  return (
    <p className={cn("text-xs", value === 0 ? "text-muted-foreground" : good ? "text-emerald-600" : "text-amber-600")}>
      {fa(value)} / {fa(max)} نویسه
      {ideal && ` (پیشنهادی: ${fa(ideal[0])} تا ${fa(ideal[1])})`}
    </p>
  )
}

export function SwitchRow({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <Label htmlFor={id}>{label}</Label>
        {description && <p className="text-muted-foreground mt-1 text-xs leading-5">{description}</p>}
      </div>
      <Switch id={id} dir="ltr" checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function FormAlert({ errors, notice }: { errors: string[]; notice: string | null }) {
  if (!errors.length && !notice) return null
  return (
    <div
      role={errors.length ? "alert" : "status"}
      className={cn(
        "mb-6 flex gap-2 rounded-lg p-3 text-sm",
        errors.length ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700"
      )}
    >
      {errors.length ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
      {errors.length ? <ul className="grid gap-1">{errors.map((e) => <li key={e}>{e}</li>)}</ul> : notice}
    </div>
  )
}

export function RobotsCard({
  index,
  follow,
  onChange,
  subject,
}: {
  index: boolean
  follow: boolean
  onChange: (value: { robotsIndex?: boolean; robotsFollow?: boolean }) => void
  // e.g. «این مقاله» / «صفحه این برند»
  subject: string
}) {
  const meta = `${index ? "index" : "noindex"}, ${follow ? "follow" : "nofollow"}`
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="text-primary size-4" />
          ربات‌های موتور جستجو
        </CardTitle>
        <CardDescription>کنترل ایندکس شدن {subject} و دنبال شدن لینک‌های آن.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <SwitchRow
          id="robots-index"
          checked={index}
          onChange={(v) => onChange({ robotsIndex: v })}
          label="ایندکس شود (index)"
          description={`خاموش = noindex؛ ${subject} در نتایج گوگل نمایش داده نمی‌شود و از نقشه سایت حذف می‌شود.`}
        />
        <SwitchRow
          id="robots-follow"
          checked={follow}
          onChange={(v) => onChange({ robotsFollow: v })}
          label="لینک‌ها دنبال شوند (follow)"
          description="خاموش = nofollow؛ موتور جستجو لینک‌های این صفحه را دنبال نمی‌کند."
        />
        <code dir="ltr" className="bg-muted block rounded-md px-3 py-2 text-left text-xs">
          {`<meta name="robots" content="${meta}">`}
        </code>
        {!index && (
          <p className="flex gap-1.5 rounded-md bg-amber-500/10 p-2 text-xs leading-5 text-amber-700">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            {subject} در گوگل ایندکس نخواهد شد.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function SeoFields({
  path,
  title,
  description,
  fallbackTitle,
  fallbackDescription,
  onChange,
}: {
  // Path segments shown in the Google preview, e.g. ["brands", "saipa"]
  path: string[]
  title: string
  description: string
  fallbackTitle: string
  fallbackDescription: string
  onChange: (value: { metaTitle?: string; metaDescription?: string }) => void
}) {
  const host = siteConfig.url.replace(/^https?:\/\//, "")
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="text-primary size-4" />
          سئو
        </CardTitle>
        <CardDescription>اگر خالی بمانند، مقدار پیش‌فرض (پیش‌نمایش زیر) استفاده می‌شود.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="bg-background rounded-xl border p-4">
          <p className="text-muted-foreground mb-2 text-xs">پیش‌نمایش در گوگل</p>
          <p className="text-muted-foreground truncate text-xs" dir="ltr">
            {[host, ...path.map((p) => p || "...")].join(" › ")}
          </p>
          <p className="mt-1 line-clamp-1 text-lg text-[#1a0dab] dark:text-[#8ab4f8]">{title || fallbackTitle}</p>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-6">
            {description || fallbackDescription || "توضیحات متا اینجا نمایش داده می‌شود."}
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="meta-title">عنوان سئو (meta title)</Label>
          <Input id="meta-title" value={title} maxLength={70} onChange={(e) => onChange({ metaTitle: e.target.value })} />
          <Counter value={title.length} max={70} ideal={[30, 60]} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="meta-description">توضیحات متا (meta description)</Label>
          <Textarea
            id="meta-description"
            rows={3}
            value={description}
            maxLength={170}
            onChange={(e) => onChange({ metaDescription: e.target.value })}
          />
          <Counter value={description.length} max={170} ideal={[120, 160]} />
        </div>
      </CardContent>
    </Card>
  )
}

export function ImagePicker({
  value,
  onChange,
  label,
  aspect = "aspect-video",
  fit = "object-cover",
}: {
  value: string | null
  onChange: (url: string | null) => void
  label: string
  aspect?: string
  fit?: "object-cover" | "object-contain"
}) {
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const onFile = async (file?: File) => {
    if (!file) return
    setBusy(true)
    setError("")
    try {
      onChange(await uploadFile(file))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="grid gap-3">
      {value ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className={cn("bg-muted w-full rounded-lg border", aspect, fit)} />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute top-2 left-2 size-7"
            aria-label={`حذف ${label}`}
            onClick={() => onChange(null)}
          >
            <X />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className={cn("text-muted-foreground hover:bg-muted grid place-items-center rounded-lg border-2 border-dashed text-sm", aspect)}
        >
          {busy ? "در حال بارگذاری..." : "انتخاب تصویر (حداکثر ۵ مگابایت)"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        aria-label={`بارگذاری ${label}`}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {value && (
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "در حال بارگذاری..." : "تغییر تصویر"}
        </Button>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

type DeleteResult = { ok: true } | { ok: false; errors: string[] }

export function DeleteButton({
  label,
  confirmText,
  action,
  redirectTo,
  withText,
}: {
  label: string
  confirmText: string
  action: () => Promise<DeleteResult>
  redirectTo?: string
  withText?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  return (
    <Button
      type="button"
      variant="ghost"
      size={withText ? "sm" : "icon"}
      disabled={pending}
      aria-label={label}
      title="حذف"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={() => {
        if (!confirm(confirmText)) return
        startTransition(async () => {
          const result = await action()
          if (!result.ok) return alert(result.errors.join("\n"))
          if (redirectTo) router.push(redirectTo)
          else router.refresh()
        })
      }}
    >
      <Trash2 />
      {withText && "حذف"}
    </Button>
  )
}

// Unsaved-changes guard and Ctrl+S shortcut shared by the editors
export function useEditorShortcuts(dirty: boolean, save: () => void, pending: boolean) {
  React.useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        if (!pending) save()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [save, pending])
}
