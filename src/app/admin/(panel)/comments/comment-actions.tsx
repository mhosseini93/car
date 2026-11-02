"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Ban, Check, Clock, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { deleteComment, setCommentStatus } from "../../blog-actions"

type Status = "pending" | "approved" | "spam"

export function CommentActions({ id, status }: { id: number; status: Status }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const run = (action: () => Promise<{ ok: boolean; errors?: string[] }>) =>
    startTransition(async () => {
      const result = await action()
      if (!result.ok) alert(result.errors?.join("\n"))
      router.refresh()
    })

  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
      {status !== "approved" && (
        <Button size="sm" disabled={pending} onClick={() => run(() => setCommentStatus(id, "approved"))}>
          <Check aria-hidden="true" />
          تأیید و انتشار
        </Button>
      )}
      {status !== "pending" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setCommentStatus(id, "pending"))}>
          <Clock aria-hidden="true" />
          {status === "approved" ? "عدم نمایش" : "بازگشت به صف"}
        </Button>
      )}
      {status !== "spam" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setCommentStatus(id, "spam"))}>
          <Ban aria-hidden="true" />
          اسپم
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          if (confirm("این دیدگاه برای همیشه حذف شود؟")) run(() => deleteComment(id))
        }}
      >
        <Trash2 aria-hidden="true" />
        حذف
      </Button>
    </div>
  )
}
