// Shopping bag with bone - pet shop
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function ServicePetshop({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true" fill="none">
      {/* Bag body */}
      <path d="M15 30 L20 70 Q20 74 24 74 L56 74 Q60 74 60 70 L65 30Z" fill={COLORS.primary} />
      {/* Bag fold */}
      <rect x="15" y="26" width="50" height="8" rx="2" fill={COLORS.primaryDark} />
      {/* Handle */}
      <path d="M28 26 Q28 12 40 12 Q52 12 52 26" stroke={COLORS.primaryDark} strokeWidth="3" fill="none" />
      {/* Paw print on bag */}
      <circle cx="40" cy="50" r="5" fill={COLORS.white} opacity="0.3" />
      <circle cx="34" cy="44" r="3" fill={COLORS.white} opacity="0.3" />
      <circle cx="46" cy="44" r="3" fill={COLORS.white} opacity="0.3" />
      <circle cx="40" cy="40" r="3" fill={COLORS.white} opacity="0.3" />
      {/* Bone sticking out */}
      <g transform="translate(42, 8) rotate(25)">
        <rect x="0" y="3" width="22" height="6" rx="3" fill={COLORS.beigeLight} />
        <circle cx="0" cy="3" r="4" fill={COLORS.beige} />
        <circle cx="0" cy="9" r="4" fill={COLORS.beige} />
        <circle cx="22" cy="3" r="4" fill={COLORS.beige} />
        <circle cx="22" cy="9" r="4" fill={COLORS.beige} />
      </g>
    </svg>
  )
}
