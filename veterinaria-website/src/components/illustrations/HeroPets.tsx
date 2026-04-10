// Happy dog and cat together - main hero illustration
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function HeroPets({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 400 300" className={className} aria-hidden="true" fill="none">
      {/* Ground shadow */}
      <ellipse cx="200" cy="275" rx="160" ry="15" fill="rgba(0,0,0,0.15)" />

      {/* Dog - left side */}
      <g transform="translate(100, 60)">
        {/* Body */}
        <ellipse cx="50" cy="150" rx="55" ry="65" fill={COLORS.beige} />
        {/* Head */}
        <circle cx="50" cy="80" r="50" fill={COLORS.beige} />
        {/* Ears - floppy */}
        <ellipse cx="10" cy="55" rx="18" ry="30" fill={COLORS.grayDark} transform="rotate(-15, 10, 55)" />
        <ellipse cx="90" cy="55" rx="18" ry="30" fill={COLORS.grayDark} transform="rotate(15, 90, 55)" />
        {/* Inner ears */}
        <ellipse cx="10" cy="58" rx="12" ry="20" fill="#c4a882" transform="rotate(-15, 10, 58)" />
        <ellipse cx="90" cy="58" rx="12" ry="20" fill="#c4a882" transform="rotate(15, 90, 58)" />
        {/* Eyes */}
        <circle cx="32" cy="75" r="8" fill={COLORS.white} />
        <circle cx="68" cy="75" r="8" fill={COLORS.white} />
        <circle cx="35" cy="76" r="5" fill="#333" />
        <circle cx="65" cy="76" r="5" fill="#333" />
        <circle cx="37" cy="74" r="2" fill={COLORS.white} />
        <circle cx="67" cy="74" r="2" fill={COLORS.white} />
        {/* Nose */}
        <ellipse cx="50" cy="92" rx="8" ry="6" fill="#333" />
        <ellipse cx="50" cy="90" rx="3" ry="2" fill="#555" />
        {/* Mouth */}
        <path d="M42 96 Q50 108 58 96" stroke="#333" strokeWidth="2" fill="none" />
        {/* Tongue */}
        <ellipse cx="50" cy="107" rx="7" ry="10" fill={COLORS.accent} />
        <ellipse cx="50" cy="105" rx="5" ry="6" fill="#f07070" />
        {/* Collar */}
        <rect x="20" y="120" width="60" height="10" rx="5" fill={COLORS.primary} />
        <circle cx="50" cy="130" r="5" fill={COLORS.primaryLight} />
        {/* Front legs */}
        <rect x="20" y="190" width="18" height="40" rx="9" fill={COLORS.beige} />
        <rect x="62" y="190" width="18" height="40" rx="9" fill={COLORS.beige} />
        {/* Paws */}
        <ellipse cx="29" cy="232" rx="12" ry="6" fill={COLORS.beigeLight} />
        <ellipse cx="71" cy="232" rx="12" ry="6" fill={COLORS.beigeLight} />
        {/* Tail - wagging */}
        <path d="M105 140 Q135 100 125 70" stroke={COLORS.beige} strokeWidth="14" strokeLinecap="round" fill="none" />
      </g>

      {/* Cat - right side */}
      <g transform="translate(230, 90)">
        {/* Body */}
        <ellipse cx="50" cy="130" rx="40" ry="55" fill={COLORS.gray} />
        {/* Head */}
        <circle cx="50" cy="70" r="40" fill={COLORS.gray} />
        {/* Ears - pointed */}
        <polygon points="20,45 10,10 38,38" fill={COLORS.gray} />
        <polygon points="80,45 90,10 62,38" fill={COLORS.gray} />
        <polygon points="22,42 15,18 35,38" fill="#ffc0c0" />
        <polygon points="78,42 85,18 65,38" fill="#ffc0c0" />
        {/* Eyes */}
        <ellipse cx="35" cy="65" rx="7" ry="8" fill={COLORS.white} />
        <ellipse cx="65" cy="65" rx="7" ry="8" fill={COLORS.white} />
        <ellipse cx="35" cy="66" rx="4" ry="6" fill={COLORS.green} />
        <ellipse cx="65" cy="66" rx="4" ry="6" fill={COLORS.green} />
        <ellipse cx="35" cy="66" rx="2" ry="5" fill="#333" />
        <ellipse cx="65" cy="66" rx="2" ry="5" fill="#333" />
        <ellipse cx="36" cy="63" rx="1.5" ry="2" fill={COLORS.white} />
        <ellipse cx="66" cy="63" rx="1.5" ry="2" fill={COLORS.white} />
        {/* Nose */}
        <polygon points="50,78 46,82 54,82" fill="#ffb6b6" />
        {/* Mouth */}
        <path d="M46 82 Q50 88 54 82" stroke="#999" strokeWidth="1.5" fill="none" />
        {/* Whiskers */}
        <line x1="10" y1="75" x2="32" y2="78" stroke="#ccc" strokeWidth="1.5" />
        <line x1="8" y1="82" x2="32" y2="82" stroke="#ccc" strokeWidth="1.5" />
        <line x1="68" y1="78" x2="90" y2="75" stroke="#ccc" strokeWidth="1.5" />
        <line x1="68" y1="82" x2="92" y2="82" stroke="#ccc" strokeWidth="1.5" />
        {/* Collar */}
        <rect x="22" y="100" width="56" height="8" rx="4" fill={COLORS.accent} />
        <circle cx="50" cy="108" r="4" fill="#f07070" />
        {/* Front legs */}
        <rect x="22" y="165" width="14" height="35" rx="7" fill={COLORS.gray} />
        <rect x="62" y="165" width="14" height="35" rx="7" fill={COLORS.gray} />
        {/* Paws */}
        <ellipse cx="29" cy="202" rx="10" ry="5" fill={COLORS.white} />
        <ellipse cx="69" cy="202" rx="10" ry="5" fill={COLORS.white} />
        {/* Tail - curled */}
        <path d="M90 130 Q120 110 115 80 Q112 65 100 70" stroke={COLORS.gray} strokeWidth="10" strokeLinecap="round" fill="none" />
      </g>

      {/* Vida+ cross floating above */}
      <g transform="translate(185, 15)">
        <rect x="10" y="0" width="12" height="32" rx="3" fill={COLORS.accent} />
        <rect x="0" y="10" width="32" height="12" rx="3" fill={COLORS.accent} />
      </g>

      {/* Small hearts */}
      <path d="M155 30 Q155 22 162 22 Q169 22 169 30 Q169 38 162 44 Q155 38 155 30Z" fill={COLORS.accent} opacity="0.5" />
      <path d="M250 40 Q250 35 254 35 Q258 35 258 40 Q258 45 254 48 Q250 45 250 40Z" fill={COLORS.accent} opacity="0.4" />
    </svg>
  )
}
