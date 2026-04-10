// Stethoscope with heart - veterinary clinic
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function ServiceClinic({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true" fill="none">
      {/* Stethoscope tube */}
      <path d="M25 15 L25 35 Q25 55 45 55 Q65 55 65 35 L65 28" stroke={COLORS.primary} strokeWidth="4" strokeLinecap="round" />
      {/* Earpieces */}
      <circle cx="25" cy="12" r="4" fill={COLORS.primaryDark} />
      <circle cx="65" cy="25" r="4" fill={COLORS.primaryDark} />
      {/* Chest piece */}
      <circle cx="45" cy="55" r="10" fill={COLORS.primary} />
      <circle cx="45" cy="55" r="6" fill={COLORS.primaryLight} />
      {/* Heart */}
      <path d="M36 30 Q36 22 43 22 Q50 22 50 30 Q50 38 43 44 Q36 38 36 30Z" fill={COLORS.accent} />
      {/* Paw print on heart */}
      <circle cx="43" cy="32" r="2" fill={COLORS.white} opacity="0.7" />
      <circle cx="39" cy="29" r="1.2" fill={COLORS.white} opacity="0.7" />
      <circle cx="47" cy="29" r="1.2" fill={COLORS.white} opacity="0.7" />
      <circle cx="43" cy="27" r="1.2" fill={COLORS.white} opacity="0.7" />
    </svg>
  )
}
