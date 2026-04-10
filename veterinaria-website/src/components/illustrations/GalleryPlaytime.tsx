// Dog and cat playing together
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function GalleryPlaytime({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      {/* Ground */}
      <ellipse cx="100" cy="175" rx="85" ry="10" fill={COLORS.green} opacity="0.15" />

      {/* Ball */}
      <circle cx="100" cy="145" r="15" fill={COLORS.accent} />
      <path d="M90 138 Q100 130 110 138" stroke={COLORS.white} strokeWidth="2" fill="none" opacity="0.4" />
      <circle cx="95" cy="140" r="2" fill={COLORS.white} opacity="0.3" />

      {/* Dog - left, playful pose */}
      <g transform="translate(15, 55)">
        {/* Body - bowing down */}
        <ellipse cx="55" cy="80" rx="35" ry="25" fill={COLORS.beige} transform="rotate(-10, 55, 80)" />
        {/* Head - lower */}
        <circle cx="30" cy="75" r="22" fill={COLORS.beige} />
        {/* Ears flopping */}
        <ellipse cx="14" cy="62" rx="8" ry="14" fill={COLORS.grayDark} transform="rotate(-20, 14, 62)" />
        <ellipse cx="46" cy="62" rx="8" ry="14" fill={COLORS.grayDark} transform="rotate(10, 46, 62)" />
        {/* Eyes - excited */}
        <circle cx="23" cy="72" r="4" fill={COLORS.white} />
        <circle cx="37" cy="72" r="4" fill={COLORS.white} />
        <circle cx="25" cy="73" r="2.5" fill="#333" />
        <circle cx="35" cy="73" r="2.5" fill="#333" />
        <circle cx="26" cy="71" r="1" fill={COLORS.white} />
        <circle cx="36" cy="71" r="1" fill={COLORS.white} />
        {/* Nose */}
        <ellipse cx="30" cy="82" rx="4" ry="3" fill="#333" />
        {/* Open mouth - happy */}
        <path d="M22 85 Q30 95 38 85" fill={COLORS.white} />
        <ellipse cx="30" cy="92" rx="5" ry="4" fill={COLORS.accent} />
        {/* Front legs - stretched out */}
        <rect x="15" y="95" width="10" height="30" rx="5" fill={COLORS.beige} />
        <rect x="35" y="95" width="10" height="28" rx="5" fill={COLORS.beige} />
        {/* Back legs */}
        <rect x="72" y="90" width="10" height="30" rx="5" fill={COLORS.beige} />
        {/* Tail - wagging up */}
        <path d="M88 65 Q105 40 95 25" stroke={COLORS.beige} strokeWidth="8" strokeLinecap="round" />
        {/* Collar */}
        <rect x="14" y="90" width="35" height="5" rx="2.5" fill={COLORS.primary} />
      </g>

      {/* Cat - right, pouncing pose */}
      <g transform="translate(115, 60)">
        {/* Body */}
        <ellipse cx="35" cy="70" rx="25" ry="20" fill={COLORS.gray} transform="rotate(5, 35, 70)" />
        {/* Head */}
        <circle cx="55" cy="55" r="18" fill={COLORS.gray} />
        {/* Ears */}
        <polygon points="46,42 40,25 53,38" fill={COLORS.gray} />
        <polygon points="64,42 70,25 57,38" fill={COLORS.gray} />
        <polygon points="47,40 43,30 52,38" fill="#ffc0c0" />
        <polygon points="63,40 67,30 58,38" fill="#ffc0c0" />
        {/* Eyes - focused */}
        <ellipse cx="50" cy="53" rx="4" ry="4.5" fill={COLORS.white} />
        <ellipse cx="62" cy="53" rx="4" ry="4.5" fill={COLORS.white} />
        <ellipse cx="50" cy="54" rx="2.5" ry="4" fill={COLORS.green} />
        <ellipse cx="62" cy="54" rx="2.5" ry="4" fill={COLORS.green} />
        <ellipse cx="50" cy="54" rx="1.2" ry="3.5" fill="#333" />
        <ellipse cx="62" cy="54" rx="1.2" ry="3.5" fill="#333" />
        {/* Nose */}
        <polygon points="56,60 54,63 58,63" fill="#ffb6b6" />
        {/* Whiskers */}
        <line x1="40" y1="60" x2="48" y2="62" stroke="#ccc" strokeWidth="1" />
        <line x1="40" y1="65" x2="48" y2="64" stroke="#ccc" strokeWidth="1" />
        <line x1="64" y1="62" x2="72" y2="60" stroke="#ccc" strokeWidth="1" />
        <line x1="64" y1="64" x2="72" y2="65" stroke="#ccc" strokeWidth="1" />
        {/* Front paw reaching for ball */}
        <rect x="18" y="80" width="8" height="25" rx="4" fill={COLORS.gray} />
        <rect x="32" y="82" width="8" height="22" rx="4" fill={COLORS.gray} />
        {/* Back legs */}
        <rect x="10" y="78" width="8" height="28" rx="4" fill={COLORS.gray} />
        {/* Tail - up */}
        <path d="M12 60 Q-5 40 0 20" stroke={COLORS.gray} strokeWidth="6" strokeLinecap="round" />
        {/* Collar */}
        <rect x="42" y="68" width="28" height="4" rx="2" fill={COLORS.accent} />
      </g>

      {/* Motion lines */}
      <line x1="95" y1="25" x2="95" y2="15" stroke={COLORS.primaryLight} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <line x1="85" y1="30" x2="80" y2="22" stroke={COLORS.primaryLight} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <line x1="105" y1="30" x2="110" y2="22" stroke={COLORS.primaryLight} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}
