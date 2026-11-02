"use client"

import * as React from "react"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Columns3,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fa } from "@/lib/format"
import type { FooterColumn, FooterSettings } from "@/lib/site-settings"
import { cn } from "@/lib/utils"

import { saveFooterSettings } from "../../actions"

// Limits mirror the backend DTO
const MAX_COLUMNS = 3
const MAX_LINKS = 12
const HREF_PATTERN = /^(\/(?!\/)|#|https?:\/\/|tel:|mailto:)/

type EditableLink = { id: string; label: string; href: string }
type EditableColumn = { id: string; title: string; links: EditableLink[] }

const uid = () => crypto.randomUUID()

const toEditable = (columns: FooterColumn[]): EditableColumn[] =>
  columns.map((c) => ({ id: uid(), title: c.title, links: c.links.map((l) => ({ id: uid(), ...l })) }))

const toPayload = (columns: EditableColumn[]): FooterColumn[] =>
  columns.map((c) => ({
    title: c.title.trim(),
    links: c.links.map((l) => ({ label: l.label.trim(), href: l.href.trim() })),
  }))

// Fixed key order, since the API (Postgres jsonb) may return keys in any order
const serialize = (columns: FooterColumn[]) =>
  JSON.stringify(
    columns.map((c) => ({
      title: c.title,
      links: c.links.map((l) => ({ label: l.label, href: l.href })),
    }))
  )

function move<T>(list: T[], index: number, offset: number): T[] {
  const target = index + offset
  if (target < 0 || target >= list.length) return list
  const next = [...list]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

function validate(columns: EditableColumn[]): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const column of columns) {
    if (!column.title.trim()) errors[column.id] = "عنوان ستون را وارد کنید"
    for (const link of column.links) {
      if (!link.label.trim()) errors[`${link.id}:label`] = "عنوان لینک را وارد کنید"
      if (!HREF_PATTERN.test(link.href.trim())) {
        errors[`${link.id}:href`] = "آدرس باید با / یا # یا https:// یا tel: یا mailto: شروع شود"
      }
    }
  }
  return errors
}

function formatDate(value: string | null) {
  if (!value) return null
  // The API returns an ISO 8601 timestamp
  return new Date(value).toLocaleString("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function FooterLinksEditor({ initial }: { initial: FooterSettings }) {
  const [saved, setSaved] = React.useState(() => serialize(initial.columns))
  const [updatedAt, setUpdatedAt] = React.useState(initial.updatedAt)
  const [columns, setColumns] = React.useState(() => toEditable(initial.columns))
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [result, setResult] = React.useState<{ ok: boolean; messages: string[] } | null>(null)
  const [pending, startTransition] = React.useTransition()

  const dirty = serialize(toPayload(columns)) !== saved

  const update = (fn: (columns: EditableColumn[]) => EditableColumn[]) => {
    setColumns(fn)
    setResult(null)
  }
  const updateColumn = (id: string, fn: (c: EditableColumn) => EditableColumn) =>
    update((cols) => cols.map((c) => (c.id === id ? fn(c) : c)))

  const handleSave = () => {
    const found = validate(columns)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setResult({ ok: false, messages: ["لطفاً خطاهای مشخص‌شده را برطرف کنید."] })
      return
    }

    startTransition(async () => {
      const res = await saveFooterSettings(toPayload(columns))
      if (res.ok) {
        setSaved(serialize(res.settings.columns))
        setUpdatedAt(res.settings.updatedAt)
        setResult({ ok: true, messages: ["تغییرات ذخیره شد و در فوتر سایت اعمال شد."] })
      } else {
        setResult({ ok: false, messages: res.errors })
      }
    })
  }

  const handleReset = () => {
    setColumns(toEditable(JSON.parse(saved)))
    setErrors({})
    setResult(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Columns3 className="text-primary size-5" aria-hidden="true" />
          لینک‌های فوتر
        </CardTitle>
        <CardDescription>
          ستون‌های لینک فوتر سایت را مدیریت کنید (حداکثر {fa(MAX_COLUMNS)} ستون و {fa(MAX_LINKS)}{" "}
          لینک در هر ستون). لوگو و اطلاعات تماس ثابت هستند.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        {columns.map((column, ci) => (
          <section
            key={column.id}
            aria-label={`ستون ${fa(ci + 1)}`}
            className="bg-muted/30 rounded-xl border p-4"
          >
            <div className="flex items-end gap-2">
              <div className="grid flex-1 gap-1.5">
                <Label htmlFor={`col-${column.id}`}>عنوان ستون {fa(ci + 1)}</Label>
                <Input
                  id={`col-${column.id}`}
                  value={column.title}
                  maxLength={40}
                  aria-invalid={!!errors[column.id]}
                  onChange={(e) => updateColumn(column.id, (c) => ({ ...c, title: e.target.value }))}
                  className="bg-background font-semibold"
                />
              </div>
              <IconButton
                label="انتقال ستون به قبل"
                disabled={ci === 0}
                onClick={() => update((cols) => move(cols, ci, -1))}
              >
                <ArrowUp />
              </IconButton>
              <IconButton
                label="انتقال ستون به بعد"
                disabled={ci === columns.length - 1}
                onClick={() => update((cols) => move(cols, ci, 1))}
              >
                <ArrowDown />
              </IconButton>
              <IconButton
                label="حذف ستون"
                destructive
                disabled={columns.length === 1}
                onClick={() => {
                  if (confirm(`ستون «${column.title || "بدون عنوان"}» و همه لینک‌هایش حذف شود؟`)) {
                    update((cols) => cols.filter((c) => c.id !== column.id))
                  }
                }}
              >
                <Trash2 />
              </IconButton>
            </div>
            <FieldError message={errors[column.id]} />

            <ul className="mt-4 grid gap-3">
              {column.links.map((link, li) => {
                const setLink = (patch: Partial<EditableLink>) =>
                  updateColumn(column.id, (c) => ({
                    ...c,
                    links: c.links.map((l) => (l.id === link.id ? { ...l, ...patch } : l)),
                  }))
                const labelError = errors[`${link.id}:label`]
                const hrefError = errors[`${link.id}:href`]

                return (
                  <li key={link.id} className="bg-background rounded-lg border p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                      <div className="grid flex-1 gap-1">
                        <Label htmlFor={`label-${link.id}`} className="text-muted-foreground text-xs">
                          عنوان لینک
                        </Label>
                        <Input
                          id={`label-${link.id}`}
                          value={link.label}
                          maxLength={60}
                          aria-invalid={!!labelError}
                          onChange={(e) => setLink({ label: e.target.value })}
                        />
                        <FieldError message={labelError} />
                      </div>
                      <div className="grid flex-1 gap-1">
                        <Label htmlFor={`href-${link.id}`} className="text-muted-foreground text-xs">
                          آدرس
                        </Label>
                        <Input
                          id={`href-${link.id}`}
                          value={link.href}
                          dir="ltr"
                          maxLength={300}
                          placeholder="/brands/saipa"
                          aria-invalid={!!hrefError}
                          onChange={(e) => setLink({ href: e.target.value })}
                          className="text-left"
                        />
                        <FieldError message={hrefError} />
                      </div>
                      <div className="flex gap-1 sm:pt-5">
                        <IconButton
                          label="انتقال لینک به بالا"
                          disabled={li === 0}
                          onClick={() =>
                            updateColumn(column.id, (c) => ({ ...c, links: move(c.links, li, -1) }))
                          }
                        >
                          <ArrowUp />
                        </IconButton>
                        <IconButton
                          label="انتقال لینک به پایین"
                          disabled={li === column.links.length - 1}
                          onClick={() =>
                            updateColumn(column.id, (c) => ({ ...c, links: move(c.links, li, 1) }))
                          }
                        >
                          <ArrowDown />
                        </IconButton>
                        <IconButton
                          label="حذف لینک"
                          destructive
                          onClick={() =>
                            updateColumn(column.id, (c) => ({
                              ...c,
                              links: c.links.filter((l) => l.id !== link.id),
                            }))
                          }
                        >
                          <Trash2 />
                        </IconButton>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-background mt-3"
              disabled={column.links.length >= MAX_LINKS}
              onClick={() =>
                updateColumn(column.id, (c) => ({
                  ...c,
                  links: [...c.links, { id: uid(), label: "", href: "/" }],
                }))
              }
            >
              <Plus aria-hidden="true" />
              افزودن لینک
            </Button>
          </section>
        ))}

        <Button
          type="button"
          variant="outline"
          className="border-dashed"
          disabled={columns.length >= MAX_COLUMNS}
          onClick={() =>
            update((cols) => [...cols, { id: uid(), title: "", links: [] }])
          }
        >
          <Plus aria-hidden="true" />
          افزودن ستون
          {columns.length >= MAX_COLUMNS && ` (حداکثر ${fa(MAX_COLUMNS)} ستون)`}
        </Button>

        {result && (
          <div
            role={result.ok ? "status" : "alert"}
            className={cn(
              "flex gap-2 rounded-lg p-3 text-sm",
              result.ok ? "bg-emerald-500/10 text-emerald-700" : "bg-destructive/10 text-destructive"
            )}
          >
            {result.ok ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <ul className="grid gap-1">
              {result.messages.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-background/95 sticky bottom-0 flex-wrap justify-between gap-3 border-t py-4 backdrop-blur">
        <p className="text-muted-foreground text-xs" suppressHydrationWarning>
          {dirty
            ? "تغییرات ذخیره‌نشده دارید"
            : updatedAt
              ? `آخرین ذخیره: ${formatDate(updatedAt)}`
              : "هنوز ذخیره نشده (مقادیر پیش‌فرض)"}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" disabled={!dirty || pending} onClick={handleReset}>
            <RotateCcw aria-hidden="true" />
            بازگردانی
          </Button>
          <Button type="button" disabled={!dirty || pending} onClick={handleSave}>
            <Save aria-hidden="true" />
            {pending ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function IconButton({
  label,
  destructive,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string; destructive?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      className={cn(destructive && "text-destructive hover:bg-destructive/10 hover:text-destructive")}
      {...props}
    >
      {children}
    </Button>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-destructive text-xs">{message}</p>
}
