// Flask with paw print - laboratory
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function ServiceLab({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true" fill="none">
      {/* Flask body */}
      <path d="M30 10 L30 30 L15 60 Q12 68 20 70 L60 70 Q68 68 65 60 L50 30 L50 10Z" fill={COLORS.primaryLight} opacity="0.3" stroke={COLORS.primary} strokeWidth="2.5" />
      {/* Flask top */}
      <rect x="28" y="6" width="24" height="6" rx="2" fill={COLORS.primary} />
      {/* Liquid */}
      <path d="M20 55 Q22 48 30 48 Q38 52 45 48 Q52 44 58 48 L60 55 Q62 65 55 68 L25 68 Q18 65 20 55Z" fill={COLORS.green} opacity="0.6" />
      {/* Bubbles */}
      <circle cx="35" cy="52" r="3" fill={COLORS.greenLight} opacity="0.5" />
      <circle cx="48" cy="48" r="2" fill={COLORS.greenLight} opacity="0.4" />
      <circle cx="40" cy="44" r="1.5" fill={COLORS.greenLight} opacity="0.3" />
      {/* Paw print */}
      <circle cx="40" cy="60" r="3.5" fill={COLORS.white} opacity="0.6" />
      <circle cx="35" cy="56" r="2" fill={COLORS.white} opacity="0.6" />
      <circle cx="45" cy="56" r="2" fill={COLORS.white} opacity="0.6" />
      <circle cx="40" cy="54" r="2" fill={COLORS.white} opacity="0.6" />
    </svg>
  )
}
