import type { Metadata } from "next"
import { Suspense } from "react"

import { EditorSkeleton } from "../../posts/editor-skeleton"
import { BrandEditor } from "../brand-editor"

export const metadata: Metadata = { title: "برند جدید" }

export default function NewBrandPage() {
  return (
    // The rich-text editor can't be prerendered, so it streams in
    <Suspense fallback={<EditorSkeleton />}>
      <BrandEditor brand={null} carCount={0} />
    </Suspense>
  )
}
