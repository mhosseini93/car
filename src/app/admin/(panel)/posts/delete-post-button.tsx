"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { deletePost } from "../../blog-actions"

export function DeletePostButton({
  id,
  title,
  redirectTo,
}: {
  id: number
  title: string
  redirectTo?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={pending}
      aria-label={`حذف ${title}`}
      title="حذف"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={() => {
        if (!confirm(`مقاله «${title}» و همه دیدگاه‌هایش برای همیشه حذف شود؟`)) return
        startTransition(async () => {
          const result = await deletePost(id)
          if (!result.ok) return alert(result.errors.join("\n"))
          if (redirectTo) router.push(redirectTo)
          else router.refresh()
        })
      }}
    >
      <Trash2 />
    </Button>
  )
}
