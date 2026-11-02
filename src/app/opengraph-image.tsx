import { ImageResponse } from "next/og"

import { brandGradient, carDataUri } from "@/lib/brand-image"

export const alt = "خودرو قسطی؛ خرید اقساطی خودرو بدون ضامن"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: brandGradient,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 110,
            left: 0,
            right: 0,
            height: 6,
            background: "rgba(255,255,255,0.25)",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={carDataUri()} width={840} height={350} alt="" />
      </div>
    ),
    size
  )
}
