// Three vet professionals - about us section
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function VetTeam({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 300 180" className={className} aria-hidden="true" fill="none">
      {/* Person 1 - left, holding small pet */}
      <g transform="translate(30, 20)">
        <circle cx="40" cy="35" r="22" fill={COLORS.beige} />
        <path d="M22 25 Q40 12 58 25" fill="#5a3e28" />
        <path d="M20 30 Q22 45 25 48" fill="#5a3e28" />
        <circle cx="33" cy="33" r="2.5" fill="#333" />
        <circle cx="47" cy="33" r="2.5" fill="#333" />
        <path d="M36 42 Q40 46 44 42" stroke="#333" strokeWidth="1.2" fill="none" />
        <rect x="25" y="57" width="30" height="55" rx="8" fill={COLORS.white} stroke={COLORS.primary} strokeWidth="1.5" />
        {/* Coat pockets */}
        <rect x="28" y="85" width="10" height="8" rx="2" fill={COLORS.primary} opacity="0.15" />
        {/* Small cat being held */}
        <g transform="translate(52, 70)">
          <ellipse cx="10" cy="10" rx="10" ry="8" fill={COLORS.gray} />
          <circle cx="10" cy="2" r="7" fill={COLORS.gray} />
          <polygon points="5,0 2,-8 8,-2" fill={COLORS.gray} />
          <polygon points="15,0 18,-8 12,-2" fill={COLORS.gray} />
          <circle cx="7" cy="1" r="1.5" fill="#333" />
          <circle cx="13" cy="1" r="1.5" fill="#333" />
          <polygon points="10,4 9,6 11,6" fill="#ffb6b6" />
        </g>
        {/* Arm holding cat */}
        <path d="M55 70 Q65 75 62 85" stroke={COLORS.beige} strokeWidth="6" strokeLinecap="round" />
        {/* Legs */}
        <rect x="30" y="112" width="10" height="35" rx="5" fill={COLORS.primaryDark} />
        <rect x="44" y="112" width="10" height="35" rx="5" fill={COLORS.primaryDark} />
      </g>

      {/* Person 2 - center, with stethoscope */}
      <g transform="translate(115, 10)">
        <circle cx="40" cy="35" r="24" fill="#c4a882" />
        <path d="M20 25 Q40 10 60 25" fill="#333" />
        <circle cx="33" cy="33" r="2.5" fill="#333" />
        <circle cx="47" cy="33" r="2.5" fill="#333" />
        <path d="M36 42 Q40 46 44 42" stroke="#333" strokeWidth="1.2" fill="none" />
        <rect x="23" y="59" width="34" height="60" rx="10" fill={COLORS.white} stroke={COLORS.primary} strokeWidth="2" />
        {/* Stethoscope */}
        <path d="M35 65 Q30 85 40 95" stroke={COLORS.primary} strokeWidth="2.5" fill="none" />
        <circle cx="40" cy="97" r="4" fill={COLORS.primary} />
        {/* Name badge */}
        <rect x="30" y="65" width="20" height="8" rx="2" fill={COLORS.primary} />
        <rect x="33" y="67" width="14" height="4" rx="1" fill={COLORS.white} />
        {/* Legs */}
        <rect x="28" y="119" width="12" height="38" rx="6" fill={COLORS.primaryDark} />
        <rect x="44" y="119" width="12" height="38" rx="6" fill={COLORS.primaryDark} />
      </g>

      {/* Person 3 - right, with clipboard */}
      <g transform="translate(200, 20)">
        <circle cx="40" cy="35" r="22" fill={COLORS.beige} />
        <path d="M22 22 Q40 10 58 22" fill={COLORS.grayDarker} />
        <path d="M58 28 Q60 42 57 48" fill={COLORS.grayDarker} />
        <circle cx="33" cy="33" r="2.5" fill="#333" />
        <circle cx="47" cy="33" r="2.5" fill="#333" />
        <path d="M36 42 Q40 46 44 42" stroke="#333" strokeWidth="1.2" fill="none" />
        <rect x="25" y="57" width="30" height="55" rx="8" fill={COLORS.white} stroke={COLORS.primary} strokeWidth="1.5" />
        {/* Clipboard */}
        <g transform="translate(-5, 65)">
          <rect x="0" y="0" width="22" height="30" rx="2" fill={COLORS.beigeLight} stroke={COLORS.grayDark} strokeWidth="1.5" />
          <rect x="6" y="-3" width="10" height="6" rx="2" fill={COLORS.grayDark} />
          <line x1="4" y1="10" x2="18" y2="10" stroke={COLORS.grayDark} strokeWidth="1.2" />
          <line x1="4" y1="15" x2="18" y2="15" stroke={COLORS.grayDark} strokeWidth="1.2" />
          <line x1="4" y1="20" x2="14" y2="20" stroke={COLORS.grayDark} strokeWidth="1.2" />
        </g>
        {/* Arm holding clipboard */}
        <path d="M25 70 Q15 80 10 85" stroke={COLORS.beige} strokeWidth="6" strokeLinecap="round" />
        {/* Legs */}
        <rect x="30" y="112" width="10" height="35" rx="5" fill={COLORS.primaryDark} />
        <rect x="44" y="112" width="10" height="35" rx="5" fill={COLORS.primaryDark} />
      </g>

      {/* Vida+ cross above center person */}
      <g transform="translate(145, 0)">
        <rect x="3" y="0" width="5" height="12" rx="1.5" fill={COLORS.accent} opacity="0.5" />
        <rect x="0" y="3" width="11" height="5" rx="1.5" fill={COLORS.accent} opacity="0.5" />
      </g>
    </svg>
  )
}
