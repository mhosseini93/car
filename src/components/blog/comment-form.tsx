"use client"

import { useActionState } from "react"
import { AlertCircle, CheckCircle2, Send } from "lucide-react"

import { submitComment, type CommentState } from "@/app/(site)/blog/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function CommentForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState<CommentState, FormData>(
    submitComment.bind(null, slug),
    { status: "idle" }
  )

  if (state.status === "success") {
    return (
      <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-700">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
        دیدگاه شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود. ممنون از همراهی شما!
      </p>
    )
  }

  return (
    <form action={formAction} className="grid gap-4 rounded-2xl border p-5">
      <h3 className="font-bold">دیدگاه خود را بنویسید</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="comment-name">نام *</Label>
          <Input id="comment-name" name="authorName" autoComplete="name" maxLength={60} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="comment-email">ایمیل (منتشر نمی‌شود)</Label>
          <Input id="comment-email" name="authorEmail" type="email" autoComplete="email" dir="ltr" maxLength={120} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="comment-content">دیدگاه *</Label>
        <Textarea id="comment-content" name="content" rows={5} maxLength={2000} required />
      </div>
      {/* Honeypot: hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
        <label htmlFor="comment-website">وب‌سایت</label>
        <input id="comment-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
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
        <Button type="submit" disabled={pending}>
          <Send aria-hidden="true" />
          {pending ? "در حال ارسال..." : "ارسال دیدگاه"}
        </Button>
      </div>
    </form>
  )
}
