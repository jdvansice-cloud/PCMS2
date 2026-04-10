// Family with their pet
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function GalleryFamily({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      {/* Ground */}
      <ellipse cx="100" cy="180" rx="90" ry="12" fill={COLORS.green} opacity="0.2" />

      {/* Person 1 - left */}
      <circle cx="55" cy="65" r="16" fill={COLORS.beige} />
      <path d="M42 55 Q55 42 68 55" fill="#333" />
      <circle cx="50" cy="63" r="2" fill="#333" />
      <circle cx="60" cy="63" r="2" fill="#333" />
      <path d="M52 70 Q55 74 58 70" stroke="#333" strokeWidth="1.2" fill="none" />
      <rect x="42" y="81" width="26" height="45" rx="8" fill={COLORS.primary} />
      <rect x="42" y="126" width="11" height="40" rx="5" fill={COLORS.primaryDark} />
      <rect x="57" y="126" width="11" height="40" rx="5" fill={COLORS.primaryDark} />

      {/* Person 2 - right */}
      <circle cx="145" cy="60" r="16" fill="#c4a882" />
      <path d="M132 48 Q145 38 158 52" fill="#5a3e28" />
      <path d="M130 55 Q132 68 135 70" fill="#5a3e28" />
      <path d="M160 55 Q158 68 155 70" fill="#5a3e28" />
      <circle cx="140" cy="58" r="2" fill="#333" />
      <circle cx="150" cy="58" r="2" fill="#333" />
      <path d="M142 65 Q145 69 148 65" stroke="#333" strokeWidth="1.2" fill="none" />
      <rect x="132" y="76" width="26" height="48" rx="8" fill={COLORS.accent} />
      <rect x="132" y="124" width="11" height="42" rx="5" fill={COLORS.accentDark} />
      <rect x="147" y="124" width="11" height="42" rx="5" fill={COLORS.accentDark} />

      {/* Child - center */}
      <circle cx="100" cy="90" r="12" fill={COLORS.beige} />
      <path d="M90 82 Q100 75 110 82" fill={COLORS.grayDarker} />
      <circle cx="96" cy="89" r="1.8" fill="#333" />
      <circle cx="104" cy="89" r="1.8" fill="#333" />
      <path d="M97 95 Q100 98 103 95" stroke="#333" strokeWidth="1" fill="none" />
      <rect x="90" y="102" width="20" height="35" rx="6" fill={COLORS.greenLight} />
      <rect x="90" y="137" width="8" height="30" rx="4" fill={COLORS.primaryDark} />
      <rect x="102" y="137" width="8" height="30" rx="4" fill={COLORS.primaryDark} />

      {/* Dog - front center */}
      <g transform="translate(70, 130)">
        <ellipse cx="30" cy="22" rx="22" ry="16" fill={COLORS.beige} />
        <circle cx="30" cy="6" r="14" fill={COLORS.beige} />
        <ellipse cx="20" cy="-2" rx="5" ry="10" fill={COLORS.grayDark} transform="rotate(-10, 20, -2)" />
        <ellipse cx="40" cy="-2" rx="5" ry="10" fill={COLORS.grayDark} transform="rotate(10, 40, -2)" />
        <circle cx="25" cy="5" r="2.5" fill="#333" />
        <circle cx="35" cy="5" r="2.5" fill="#333" />
        <ellipse cx="30" cy="11" rx="3" ry="2" fill="#333" />
        <path d="M27 13 Q30 17 33 13" stroke="#333" strokeWidth="1" fill="none" />
        <ellipse cx="30" cy="18" rx="3" ry="4" fill={COLORS.accent} />
        <rect x="18" y="30" width="8" height="15" rx="4" fill={COLORS.beige} />
        <rect x="34" y="30" width="8" height="15" rx="4" fill={COLORS.beige} />
      </g>

      {/* Heart above */}
      <path d="M92 35 Q92 27 100 27 Q108 27 108 35 Q108 43 100 50 Q92 43 92 35Z" fill={COLORS.accent} opacity="0.4" />
    </svg>
  )
}
