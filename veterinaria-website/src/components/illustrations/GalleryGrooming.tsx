// Dog being bathed with bubbles
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function GalleryGrooming({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      {/* Bathtub */}
      <path d="M25 110 Q20 110 20 120 L20 165 Q20 180 35 180 L165 180 Q180 180 180 165 L180 120 Q180 110 175 110Z" fill={COLORS.white} stroke={COLORS.primary} strokeWidth="2.5" />
      {/* Water */}
      <path d="M25 125 Q50 118 75 125 Q100 132 125 125 Q150 118 175 125 L175 165 Q175 175 165 175 L35 175 Q25 175 25 165Z" fill={COLORS.primaryLight} opacity="0.2" />

      {/* Dog in tub */}
      <circle cx="100" cy="100" r="25" fill={COLORS.beige} />
      <ellipse cx="80" cy="85" rx="8" ry="14" fill={COLORS.grayDark} transform="rotate(-15, 80, 85)" />
      <ellipse cx="120" cy="85" rx="8" ry="14" fill={COLORS.grayDark} transform="rotate(15, 120, 85)" />
      <circle cx="90" cy="98" r="4" fill={COLORS.white} />
      <circle cx="110" cy="98" r="4" fill={COLORS.white} />
      <circle cx="92" cy="99" r="2.5" fill="#333" />
      <circle cx="108" cy="99" r="2.5" fill="#333" />
      <ellipse cx="100" cy="108" rx="4" ry="3" fill="#333" />
      <path d="M95 111 Q100 117 105 111" stroke="#333" strokeWidth="1.5" fill="none" />
      {/* Tongue */}
      <ellipse cx="100" cy="118" rx="4" ry="5" fill={COLORS.accent} />

      {/* Bubbles */}
      <circle cx="55" cy="85" r="10" fill={COLORS.primaryLight} opacity="0.15" stroke={COLORS.primaryLight} strokeWidth="1.5" />
      <circle cx="53" cy="83" r="3" fill={COLORS.white} opacity="0.4" />
      <circle cx="150" cy="90" r="8" fill={COLORS.primaryLight} opacity="0.15" stroke={COLORS.primaryLight} strokeWidth="1.5" />
      <circle cx="148" cy="88" r="2.5" fill={COLORS.white} opacity="0.4" />
      <circle cx="65" cy="60" r="6" fill={COLORS.primaryLight} opacity="0.12" stroke={COLORS.primaryLight} strokeWidth="1" />
      <circle cx="140" cy="65" r="7" fill={COLORS.primaryLight} opacity="0.12" stroke={COLORS.primaryLight} strokeWidth="1" />
      <circle cx="80" cy="45" r="5" fill={COLORS.primaryLight} opacity="0.1" stroke={COLORS.primaryLight} strokeWidth="1" />
      <circle cx="125" cy="50" r="4" fill={COLORS.primaryLight} opacity="0.1" stroke={COLORS.primaryLight} strokeWidth="1" />
      <circle cx="160" cy="55" r="5" fill={COLORS.primaryLight} opacity="0.1" stroke={COLORS.primaryLight} strokeWidth="1" />

      {/* Sparkles */}
      <path d="M45 40 L47 34 L49 40 L55 42 L49 44 L47 50 L45 44 L39 42Z" fill={COLORS.primaryLight} opacity="0.4" />
      <path d="M155 35 L156 31 L157 35 L161 36 L157 37 L156 41 L155 37 L151 36Z" fill={COLORS.primaryLight} opacity="0.3" />

      {/* Faucet */}
      <rect x="25" y="95" width="15" height="6" rx="3" fill={COLORS.grayDark} />
      <path d="M25 98 L15 98 L15 80" stroke={COLORS.grayDark} strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
