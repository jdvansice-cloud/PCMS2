// Vet with surgical tools - surgery scene
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function GallerySurgery({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      {/* Background cross */}
      <rect x="80" y="10" width="40" height="40" rx="8" fill={COLORS.accent} opacity="0.15" />
      <rect x="92" y="15" width="16" height="30" rx="3" fill={COLORS.accent} opacity="0.25" />
      <rect x="85" y="22" width="30" height="16" rx="3" fill={COLORS.accent} opacity="0.25" />

      {/* Operating table */}
      <rect x="30" y="130" width="140" height="6" rx="3" fill={COLORS.grayDark} />
      <rect x="40" y="136" width="6" height="45" rx="2" fill={COLORS.grayDark} />
      <rect x="154" y="136" width="6" height="45" rx="2" fill={COLORS.grayDark} />
      {/* Lamp */}
      <rect x="96" y="10" width="8" height="50" rx="2" fill={COLORS.grayDark} />
      <ellipse cx="100" cy="62" rx="20" ry="8" fill={COLORS.grayDark} />
      <ellipse cx="100" cy="68" rx="12" ry="3" fill="#ffe066" opacity="0.5" />

      {/* Pet on table (sleeping) */}
      <ellipse cx="100" cy="118" rx="35" ry="18" fill={COLORS.beige} />
      <circle cx="72" cy="108" r="14" fill={COLORS.beige} />
      <ellipse cx="64" cy="100" rx="5" ry="9" fill={COLORS.grayDark} transform="rotate(-10, 64, 100)" />
      <ellipse cx="80" cy="100" rx="5" ry="9" fill={COLORS.grayDark} transform="rotate(10, 80, 100)" />
      {/* Closed eyes (sleeping) */}
      <path d="M66 108 Q72 112 78 108" stroke="#333" strokeWidth="1.5" fill="none" />

      {/* Vet person - left */}
      <circle cx="45" cy="65" r="14" fill={COLORS.beige} />
      <rect x="32" y="79" width="26" height="40" rx="6" fill={COLORS.white} stroke={COLORS.primary} strokeWidth="1.5" />
      {/* Mask */}
      <rect x="37" y="68" width="16" height="10" rx="4" fill={COLORS.primaryLight} />
      <circle cx="41" cy="63" r="2" fill="#333" />
      <circle cx="49" cy="63" r="2" fill="#333" />
      {/* Hair */}
      <path d="M33 57 Q45 48 57 57" fill={COLORS.grayDarker} />
      {/* Cap */}
      <path d="M33 60 Q45 50 57 60" fill={COLORS.primaryLight} />

      {/* Vet person - right */}
      <circle cx="155" cy="65" r="14" fill="#c4a882" />
      <rect x="142" y="79" width="26" height="40" rx="6" fill={COLORS.white} stroke={COLORS.primary} strokeWidth="1.5" />
      {/* Mask */}
      <rect x="147" y="68" width="16" height="10" rx="4" fill={COLORS.primaryLight} />
      <circle cx="151" cy="63" r="2" fill="#333" />
      <circle cx="159" cy="63" r="2" fill="#333" />
      {/* Hair */}
      <path d="M148 55 Q155 48 168 58" fill="#333" />
      {/* Cap */}
      <path d="M143 60 Q155 50 167 60" fill={COLORS.primaryLight} />

      {/* Heart monitor line */}
      <path d="M165 90 L170 90 L173 80 L176 100 L179 85 L182 90 L190 90" stroke={COLORS.greenLight} strokeWidth="2" fill="none" />
    </svg>
  )
}
