import { ImageResponse } from "next/og"

import { brandGradient, carDataUri } from "@/lib/brand-image"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brandGradient,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={carDataUri()} width={150} height={63} alt="" />
      </div>
    ),
    size
  )
}
