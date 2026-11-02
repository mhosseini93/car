import type { Metadata } from "next"
import { Suspense } from "react"

import { adminApi, type AdminCategory, type AdminPostOption } from "@/lib/admin-api"

import { EditorSkeleton } from "../editor-skeleton"
import { PostEditor } from "../post-editor"

export const metadata: Metadata = { title: "مقاله جدید" }

export default function NewPostPage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <NewPost />
    </Suspense>
  )
}

async function NewPost() {
  const [categories, postOptions] = await Promise.all([
    adminApi<AdminCategory[]>("/admin/categories"),
    adminApi<AdminPostOption[]>("/admin/posts/options"),
  ])
  return <PostEditor post={null} categories={categories} postOptions={postOptions} />
}
