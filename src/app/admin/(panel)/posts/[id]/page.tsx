import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { adminApi, type AdminCategory, type AdminPost, type AdminPostOption } from "@/lib/admin-api"
import { ApiError } from "@/lib/api"

import { EditorSkeleton } from "../editor-skeleton"
import { PostEditor } from "../post-editor"

export const metadata: Metadata = { title: "ویرایش مقاله" }

export default function EditPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditPost params={params} />
    </Suspense>
  )
}

async function EditPost({ params }: { params: PageProps<"/admin/posts/[id]">["params"] }) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) notFound()

  const post = await adminApi<AdminPost>(`/admin/posts/${id}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  })
  const [categories, postOptions] = await Promise.all([
    adminApi<AdminCategory[]>("/admin/categories"),
    adminApi<AdminPostOption[]>("/admin/posts/options"),
  ])
  // key: remount the editor when switching between posts
  return <PostEditor key={post.id} post={post} categories={categories} postOptions={postOptions} />
}
