// Vet examining a dog on a table
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function GalleryConsultation({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      {/* Table */}
      <rect x="30" y="130" width="140" height="8" rx="3" fill={COLORS.grayDark} />
      <rect x="40" y="138" width="8" height="50" rx="2" fill={COLORS.grayDark} />
      <rect x="152" y="138" width="8" height="50" rx="2" fill={COLORS.grayDark} />

      {/* Dog on table */}
      <ellipse cx="100" cy="115" rx="35" ry="22" fill={COLORS.beige} />
      <circle cx="75" cy="95" r="18" fill={COLORS.beige} />
      <ellipse cx="63" cy="84" rx="6" ry="12" fill={COLORS.grayDark} transform="rotate(-10, 63, 84)" />
      <ellipse cx="87" cy="84" rx="6" ry="12" fill={COLORS.grayDark} transform="rotate(10, 87, 84)" />
      <circle cx="69" cy="93" r="3" fill="#333" />
      <circle cx="81" cy="93" r="3" fill="#333" />
      <ellipse cx="75" cy="100" rx="3.5" ry="2.5" fill="#333" />
      <path d="M71 102 Q75 107 79 102" stroke="#333" strokeWidth="1.2" fill="none" />
      <path d="M130 110 Q148 95 142 80" stroke={COLORS.beige} strokeWidth="8" strokeLinecap="round" />

      {/* Vet person */}
      <circle cx="155" cy="50" r="16" fill={COLORS.beige} />
      <rect x="140" y="66" width="30" height="50" rx="8" fill={COLORS.white} />
      {/* Vet coat */}
      <rect x="140" y="70" width="30" height="45" rx="5" fill={COLORS.white} stroke={COLORS.primary} strokeWidth="1.5" />
      {/* Stethoscope */}
      <path d="M150 80 Q145 100 155 105" stroke={COLORS.primary} strokeWidth="2" fill="none" />
      <circle cx="155" cy="107" r="3" fill={COLORS.primary} />
      {/* Arm reaching to pet */}
      <path d="M140 85 L110 100" stroke={COLORS.beige} strokeWidth="6" strokeLinecap="round" />
      {/* Hair */}
      <path d="M142 42 Q155 30 168 42" fill={COLORS.grayDarker} />
      {/* Face */}
      <circle cx="150" cy="48" r="2" fill="#333" />
      <circle cx="160" cy="48" r="2" fill="#333" />
      <path d="M152 55 Q155 58 158 55" stroke="#333" strokeWidth="1" fill="none" />

      {/* Medical cross */}
      <rect x="15" y="30" width="20" height="20" rx="4" fill={COLORS.accent} opacity="0.2" />
      <rect x="22" y="33" width="6" height="14" rx="1" fill={COLORS.accent} opacity="0.4" />
      <rect x="18" y="37" width="14" height="6" rx="1" fill={COLORS.accent} opacity="0.4" />
    </svg>
  )
}
