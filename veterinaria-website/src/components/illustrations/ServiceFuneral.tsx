// Heart with wings - funeral arrangements
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function ServiceFuneral({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true" fill="none">
      {/* Left wing */}
      <g opacity="0.7">
        <path d="M10 35 Q5 25 15 22 Q22 20 28 28 Q20 30 15 35 Q12 38 10 35Z" fill={COLORS.primaryLight} />
        <path d="M8 40 Q2 30 12 26 Q18 24 25 32 Q16 34 12 40 Q10 43 8 40Z" fill={COLORS.primary} opacity="0.5" />
        <path d="M12 32 Q8 26 16 24 Q20 23 24 28 Q18 30 15 33Z" fill={COLORS.primaryLight} opacity="0.6" />
      </g>
      {/* Right wing */}
      <g opacity="0.7">
        <path d="M70 35 Q75 25 65 22 Q58 20 52 28 Q60 30 65 35 Q68 38 70 35Z" fill={COLORS.primaryLight} />
        <path d="M72 40 Q78 30 68 26 Q62 24 55 32 Q64 34 68 40 Q70 43 72 40Z" fill={COLORS.primary} opacity="0.5" />
        <path d="M68 32 Q72 26 64 24 Q60 23 56 28 Q62 30 65 33Z" fill={COLORS.primaryLight} opacity="0.6" />
      </g>
      {/* Heart */}
      <path d="M28 35 Q28 22 40 22 Q52 22 52 35 Q52 48 40 58 Q28 48 28 35Z" fill={COLORS.accent} />
      <path d="M32 33 Q32 26 40 26 Q44 26 44 33" fill={COLORS.white} opacity="0.2" />
      {/* Paw in heart */}
      <circle cx="40" cy="38" r="3.5" fill={COLORS.white} opacity="0.5" />
      <circle cx="35" cy="34" r="2" fill={COLORS.white} opacity="0.5" />
      <circle cx="45" cy="34" r="2" fill={COLORS.white} opacity="0.5" />
      <circle cx="40" cy="32" r="2" fill={COLORS.white} opacity="0.5" />
      {/* Halo */}
      <ellipse cx="40" cy="16" rx="12" ry="4" stroke={COLORS.beige} strokeWidth="2" fill="none" opacity="0.6" />
    </svg>
  )
}
