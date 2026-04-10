// Scissors with bubbles - grooming
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function ServiceGrooming({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true" fill="none">
      {/* Scissors */}
      <g transform="translate(10, 15)">
        {/* Blade 1 */}
        <path d="M30 30 L55 8" stroke={COLORS.grayDarker} strokeWidth="3" strokeLinecap="round" />
        {/* Blade 2 */}
        <path d="M30 30 L55 52" stroke={COLORS.grayDarker} strokeWidth="3" strokeLinecap="round" />
        {/* Handle 1 */}
        <circle cx="22" cy="18" r="8" stroke={COLORS.primary} strokeWidth="3" fill="none" />
        {/* Handle 2 */}
        <circle cx="22" cy="42" r="8" stroke={COLORS.primary} strokeWidth="3" fill="none" />
        {/* Pivot */}
        <circle cx="30" cy="30" r="3" fill={COLORS.primaryDark} />
      </g>
      {/* Bubbles */}
      <circle cx="58" cy="20" r="8" fill={COLORS.primaryLight} opacity="0.2" stroke={COLORS.primaryLight} strokeWidth="1.5" />
      <circle cx="55" cy="22" r="2" fill={COLORS.white} opacity="0.5" />
      <circle cx="68" cy="35" r="5" fill={COLORS.primaryLight} opacity="0.2" stroke={COLORS.primaryLight} strokeWidth="1.2" />
      <circle cx="66" cy="36" r="1.5" fill={COLORS.white} opacity="0.5" />
      <circle cx="62" cy="52" r="6" fill={COLORS.primaryLight} opacity="0.2" stroke={COLORS.primaryLight} strokeWidth="1.2" />
      <circle cx="60" cy="53" r="2" fill={COLORS.white} opacity="0.5" />
      <circle cx="72" cy="48" r="3.5" fill={COLORS.primaryLight} opacity="0.15" stroke={COLORS.primaryLight} strokeWidth="1" />
      {/* Sparkles */}
      <path d="M70 15 L72 10 L74 15 L79 17 L74 19 L72 24 L70 19 L65 17Z" fill={COLORS.primaryLight} opacity="0.5" />
    </svg>
  )
}
