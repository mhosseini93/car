"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

// Previous/next buttons for a horizontal scroll row (RTL: next scrolls left)
export function ScrollButtons({ targetId, label }: { targetId: string; label: string }) {
  const [edges, setEdges] = React.useState({ start: true, end: false })

  React.useEffect(() => {
    const row = document.getElementById(targetId)
    if (!row) return
    const update = () => {
      const offset = Math.abs(row.scrollLeft)
      setEdges({ start: offset < 4, end: offset + row.clientWidth >= row.scrollWidth - 4 })
    }
    update()
    row.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      row.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [targetId])

  const scroll = (direction: 1 | -1) => {
    const row = document.getElementById(targetId)
    row?.scrollBy({ left: -direction * row.clientWidth * 0.8, behavior: "smooth" })
  }

  if (edges.start && edges.end) return null

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => scroll(-1)}
        disabled={edges.start}
        aria-controls={targetId}
        aria-label={`${label} قبلی`}
      >
        <ChevronRight />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => scroll(1)}
        disabled={edges.end}
        aria-controls={targetId}
        aria-label={`${label} بعدی`}
      >
        <ChevronLeft />
      </Button>
    </div>
  )
}
