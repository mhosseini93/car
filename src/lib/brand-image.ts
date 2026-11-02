// Shared artwork for generated icons and social images. Text is left out on
// purpose: next/og (Satori) cannot shape Persian script or lay out RTL text.

const carSvg = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100">
    <ellipse cx="122" cy="88" rx="104" ry="6" fill="black" opacity="0.25"/>
    <path d="M18 74 L18 60 Q20 51 34 49 L70 45 L98 27 Q104 22 114 22 L160 22 Q170 22 177 28 L200 45 L216 48 Q228 51 228 62 L228 74 Z" fill="${color}"/>
    <path d="M82 45 L103 30 Q107 28 113 28 L134 28 L134 45 Z" fill="#1e3a8a" opacity="0.8"/>
    <path d="M140 28 L158 28 Q166 28 171 33 L185 45 L140 45 Z" fill="#1e3a8a" opacity="0.8"/>
    <rect x="208" y="54" width="14" height="5" rx="2.5" fill="#fbbf24"/>
    <circle cx="62" cy="74" r="15" fill="#0f172a"/><circle cx="62" cy="74" r="7" fill="#cbd5e1"/>
    <circle cx="188" cy="74" r="15" fill="#0f172a"/><circle cx="188" cy="74" r="7" fill="#cbd5e1"/>
  </svg>`

export const carDataUri = (color = "#ffffff") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(carSvg(color))}`

export const brandGradient = "linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)"
