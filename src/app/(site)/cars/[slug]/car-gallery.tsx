"use client"

import * as React from "react"
import Image from "next/image"

import { CarIllustration } from "@/components/home/car-illustration"
import type { CarImage } from "@/lib/catalog"
import { fa } from "@/lib/format"
import { cn } from "@/lib/utils"

// External URLs aren't in images.remotePatterns, so serve them as-is
const unoptimized = (src: string) => !src.startsWith("/")

// The first image is server-rendered with priority (LCP); thumbnails only swap it
export function CarGallery({ images, name, color }: { images: CarImage[]; name: string; color: string }) {
  const [active, setActive] = React.useState(0)
  const current = images[active]

  if (!current) {
    return (
      <div className="bg-muted/60 grid aspect-[16/10] place-items-center rounded-2xl border p-8">
        <CarIllustration color={color} label={`تصویر ${name}`} className="w-full max-w-md" />
      </div>
    )
  }

  return (
    <div>
      <div className="bg-muted/40 relative aspect-[16/10] overflow-hidden rounded-2xl border">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt || name}
          fill
          priority={active === 0}
          sizes="(min-width: 1024px) 560px, 100vw"
          unoptimized={unoptimized(current.src)}
          className="object-contain"
        />
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label={`تصاویر ${name}`}>
          {images.map((image, i) => (
            <li key={image.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                aria-label={`نمایش تصویر ${fa(i + 1)} از ${fa(images.length)}`}
                className={cn(
                  "bg-muted/40 focus-visible:ring-ring/50 relative block h-16 w-24 overflow-hidden rounded-lg border-2 outline-none focus-visible:ring-[3px]",
                  i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="96px"
                  unoptimized={unoptimized(image.src)}
                  className="object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
