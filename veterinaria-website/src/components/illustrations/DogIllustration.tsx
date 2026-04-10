// Cute sitting dog for sterilization section
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function DogIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" fill="none">
      {/* Body */}
      <ellipse cx="60" cy="75" rx="32" ry="30" fill={COLORS.beige} />
      {/* Head */}
      <circle cx="60" cy="42" r="28" fill={COLORS.beige} />
      {/* Ears */}
      <ellipse cx="36" cy="28" rx="10" ry="18" fill={COLORS.grayDark} transform="rotate(-10, 36, 28)" />
      <ellipse cx="84" cy="28" rx="10" ry="18" fill={COLORS.grayDark} transform="rotate(10, 84, 28)" />
      {/* Eyes */}
      <circle cx="48" cy="40" r="5" fill={COLORS.white} />
      <circle cx="72" cy="40" r="5" fill={COLORS.white} />
      <circle cx="50" cy="41" r="3" fill="#333" />
      <circle cx="70" cy="41" r="3" fill="#333" />
      <circle cx="51" cy="39" r="1.2" fill={COLORS.white} />
      <circle cx="71" cy="39" r="1.2" fill={COLORS.white} />
      {/* Nose */}
      <ellipse cx="60" cy="50" rx="5" ry="3.5" fill="#333" />
      {/* Mouth */}
      <path d="M55 53 Q60 59 65 53" stroke="#333" strokeWidth="1.5" fill="none" />
      {/* Collar with medical cross */}
      <rect x="38" y="64" width="44" height="7" rx="3.5" fill={COLORS.primary} />
      <rect x="57" y="71" width="6" height="6" rx="2" fill={COLORS.white} />
      <rect x="59" y="71.5" width="2" height="5" fill={COLORS.accent} />
      <rect x="57.5" y="73" width="5" height="2" fill={COLORS.accent} />
      {/* Front legs */}
      <rect x="38" y="92" width="12" height="20" rx="6" fill={COLORS.beige} />
      <rect x="68" y="92" width="12" height="20" rx="6" fill={COLORS.beige} />
      {/* Paws */}
      <ellipse cx="44" cy="113" rx="8" ry="4" fill={COLORS.beigeLight} />
      <ellipse cx="74" cy="113" rx="8" ry="4" fill={COLORS.beigeLight} />
      {/* Tail */}
      <path d="M92 72 Q108 55 102 38" stroke={COLORS.beige} strokeWidth="8" strokeLinecap="round" fill="none" />
    </svg>
  )
}
