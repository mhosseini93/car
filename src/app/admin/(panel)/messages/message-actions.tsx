"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Mail, MailOpen, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { deleteMessage, setMessageRead } from "../../contact-actions"

export function MessageActions({ id, isRead }: { id: number; isRead: boolean }) {
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
      {isRead ? (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setMessageRead(id, false))}>
          <Mail aria-hidden="true" />
          علامت خوانده‌نشده
        </Button>
      ) : (
        <Button size="sm" disabled={pending} onClick={() => run(() => setMessageRead(id, true))}>
          <MailOpen aria-hidden="true" />
          پیگیری شد
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          if (confirm("این پیام برای همیشه حذف شود؟")) run(() => deleteMessage(id))
        }}
      >
        <Trash2 aria-hidden="true" />
        حذف
      </Button>
    </div>
  )
}
