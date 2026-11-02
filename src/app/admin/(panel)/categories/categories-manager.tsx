"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, ExternalLink, Pencil, Plus, Save, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import type { AdminCategory } from "@/lib/admin-api"
import { categoryPath } from "@/lib/blog-paths"
import { fa } from "@/lib/format"
import { SLUG_PATTERN, slugify } from "@/lib/slug"

import { deleteCategory, saveCategory } from "../../blog-actions"

type Draft = { id: number | null; name: string; slug: string; description: string; slugTouched: boolean }
const EMPTY: Draft = { id: null, name: "", slug: "", description: "", slugTouched: false }

export function CategoriesManager({ initial }: { initial: AdminCategory[] }) {
  const [categories, setCategories] = React.useState(initial)
  const [draft, setDraft] = React.useState<Draft>(EMPTY)
  const [errors, setErrors] = React.useState<string[]>([])
  const [pending, startTransition] = React.useTransition()
  const formRef = React.useRef<HTMLFormElement>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!SLUG_PATTERN.test(draft.slug)) {
      setErrors(["نامک معتبر نیست (حروف کوچک انگلیسی/فارسی، عدد و خط تیره)"])
      return
    }
    startTransition(async () => {
      const result = await saveCategory(draft.id, {
        name: draft.name,
        slug: draft.slug,
        description: draft.description,
      })
      if (!result.ok) return setErrors(result.errors)
      setCategories((list) => {
        const existing = list.find((c) => c.id === result.data.id)
        const row = { ...result.data, postCount: existing?.postCount ?? 0 }
        const next = existing ? list.map((c) => (c.id === row.id ? row : c)) : [...list, row]
        return next.sort((a, b) => a.name.localeCompare(b.name, "fa"))
      })
      setDraft(EMPTY)
      setErrors([])
    })
  }

  const remove = (category: AdminCategory) => {
    const note = category.postCount ? ` این دسته‌بندی از ${fa(category.postCount)} مقاله برداشته می‌شود.` : ""
    if (!confirm(`دسته‌بندی «${category.name}» حذف شود؟${note}`)) return
    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if (!result.ok) return alert(result.errors.join("\n"))
      setCategories((list) => list.filter((c) => c.id !== category.id))
      if (draft.id === category.id) setDraft(EMPTY)
    })
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="bg-background rounded-xl border">
        {categories.length === 0 ? (
          <p className="text-muted-foreground p-10 text-center text-sm">هنوز دسته‌بندی‌ای ساخته نشده است.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>نامک</TableHead>
                <TableHead>مقالات</TableHead>
                <TableHead className="w-28"><span className="sr-only">عملیات</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} data-state={draft.id === category.id ? "selected" : undefined}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs" dir="ltr">{category.slug}</TableCell>
                  <TableCell>{fa(category.postCount)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`ویرایش ${category.name}`}
                        title="ویرایش"
                        onClick={() => {
                          setDraft({ ...category, slugTouched: true })
                          setErrors([])
                          formRef.current?.scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={categoryPath(category.slug)} target="_blank" aria-label={`مشاهده ${category.name}`} title="مشاهده">
                          <ExternalLink />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={pending}
                        aria-label={`حذف ${category.name}`}
                        title="حذف"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => remove(category)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Card className="content-start self-start">
        <CardHeader>
          <CardTitle className="text-base">{draft.id ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={submit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cat-name">نام</Label>
              <Input
                id="cat-name"
                value={draft.name}
                maxLength={80}
                required
                onChange={(e) => {
                  const name = e.target.value
                  setDraft((d) => ({ ...d, name, slug: d.slugTouched ? d.slug : slugify(name) }))
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-slug">نامک</Label>
              <Input
                id="cat-slug"
                value={draft.slug}
                dir="ltr"
                maxLength={100}
                required
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value.toLowerCase(), slugTouched: true }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-desc">توضیحات (برای سئوی صفحه دسته‌بندی)</Label>
              <Textarea
                id="cat-desc"
                rows={3}
                maxLength={300}
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>
            {errors.length > 0 && (
              <div role="alert" className="bg-destructive/10 text-destructive flex gap-2 rounded-lg p-3 text-sm">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {draft.id ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
                {draft.id ? "ذخیره" : "افزودن"}
              </Button>
              {draft.id && (
                <Button type="button" variant="ghost" onClick={() => setDraft(EMPTY)}>
                  <X aria-hidden="true" />
                  انصراف
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
