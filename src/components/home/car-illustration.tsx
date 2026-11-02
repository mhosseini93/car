export function CarIllustration({
  color,
  label,
  className,
}: {
  color: string
  label?: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 240 100"
      className={className}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {label && <title>{label}</title>}
      <ellipse cx="122" cy="88" rx="104" ry="6" fill="black" opacity="0.12" />
      <path
        d="M18 74 L18 60 Q20 51 34 49 L70 45 L98 27 Q104 22 114 22 L160 22 Q170 22 177 28 L200 45 L216 48 Q228 51 228 62 L228 74 Z"
        fill={color}
        stroke="black"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />
      <path d="M82 45 L103 30 Q107 28 113 28 L134 28 L134 45 Z" fill="#0f172a" opacity="0.55" />
      <path d="M140 28 L158 28 Q166 28 171 33 L185 45 L140 45 Z" fill="#0f172a" opacity="0.55" />
      <rect x="208" y="54" width="14" height="5" rx="2.5" fill="#fbbf24" />
      <rect x="20" y="56" width="10" height="5" rx="2.5" fill="#ef4444" />
      {[62, 188].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="74" r="15" fill="#111827" />
          <circle cx={cx} cy="74" r="7" fill="#cbd5e1" />
        </g>
      ))}
    </svg>
  )
}
