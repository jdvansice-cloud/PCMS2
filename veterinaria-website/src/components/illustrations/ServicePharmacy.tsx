// Medicine bottle - pharmacy
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function ServicePharmacy({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true" fill="none">
      {/* Bottle body */}
      <rect x="20" y="25" width="40" height="45" rx="6" fill={COLORS.primary} />
      {/* Bottle cap */}
      <rect x="25" y="15" width="30" height="12" rx="3" fill={COLORS.primaryDark} />
      {/* Label */}
      <rect x="25" y="35" width="30" height="25" rx="3" fill={COLORS.white} />
      {/* Cross on label */}
      <rect x="37" y="39" width="6" height="16" rx="1.5" fill={COLORS.accent} />
      <rect x="32" y="44" width="16" height="6" rx="1.5" fill={COLORS.accent} />
      {/* Pill 1 */}
      <ellipse cx="58" cy="20" rx="8" ry="5" fill={COLORS.accent} transform="rotate(-30, 58, 20)" />
      <ellipse cx="61" cy="18" rx="4" ry="5" fill="#f07070" transform="rotate(-30, 61, 18)" />
      {/* Pill 2 */}
      <circle cx="65" cy="35" r="5" fill={COLORS.greenLight} />
      <path d="M65 30 A5 5 0 0 1 65 40" fill={COLORS.green} />
    </svg>
  )
}
