"use client"

import { useActionState } from "react"
import { AlertCircle, CheckCircle2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CONTACT_SUBJECTS } from "@/lib/contact"

import { submitContact, type ContactState } from "./actions"

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(submitContact, { status: "idle" })
  const values = state.values

  if (state.status === "success") {
    return (
      <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-5 text-emerald-700">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
        پیام شما ثبت شد. کارشناسان ما در اولین ساعت کاری با شما تماس می‌گیرند.
      </p>
    )
  }

  return (
    <form action={formAction} className="relative grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="contact-name">نام و نام خانوادگی *</Label>
          <Input id="contact-name" name="name" defaultValue={values?.name} autoComplete="name" maxLength={60} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-phone">شماره موبایل *</Label>
          <Input
            id="contact-phone"
            name="phone"
            defaultValue={values?.phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="09123456789"
            maxLength={20}
            required
            className="text-right"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-email">ایمیل (اختیاری)</Label>
          <Input id="contact-email" name="email" defaultValue={values?.email} type="email" autoComplete="email" dir="ltr" maxLength={120} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-subject">موضوع *</Label>
          {/* key: a form reset only restores a select's initial default, so remount it with the sent value */}
          <select
            key={values?.subject}
            id="contact-subject"
            name="subject"
            defaultValue={values?.subject ?? "purchase"}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
          >
            {CONTACT_SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-message">پیام شما *</Label>
        <Textarea
          id="contact-message"
          name="message"
          defaultValue={values?.message}
          rows={5}
          maxLength={2000}
          required
          placeholder="مثلاً خودروی مورد نظر، مبلغ پیش‌پرداخت یا سؤالتان را بنویسید."
        />
      </div>
      {/* Honeypot: hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
        <label htmlFor="contact-website">وب‌سایت</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && (
        <div role="alert" className="bg-destructive/10 text-destructive flex gap-2 rounded-lg p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <ul className="grid gap-1">
            {state.errors?.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}

      <div>
        <Button type="submit" size="lg" disabled={pending}>
          <Send aria-hidden="true" />
          {pending ? "در حال ارسال..." : "ارسال پیام"}
        </Button>
      </div>
    </form>
  )
}
