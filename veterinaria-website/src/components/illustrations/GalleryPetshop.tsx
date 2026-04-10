// Pet shop with shelves and products
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function GalleryPetshop({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      {/* Shelf 1 */}
      <rect x="20" y="55" width="160" height="5" rx="2" fill={COLORS.grayDark} />
      {/* Shelf 2 */}
      <rect x="20" y="115" width="160" height="5" rx="2" fill={COLORS.grayDark} />
      {/* Floor */}
      <rect x="10" y="170" width="180" height="5" rx="2" fill={COLORS.grayDark} />

      {/* Products on shelf 1 */}
      {/* Food bag */}
      <rect x="30" y="25" width="25" height="30" rx="3" fill={COLORS.accent} />
      <circle cx="42" cy="38" r="6" fill={COLORS.white} opacity="0.3" />
      <rect x="34" y="27" width="17" height="5" rx="1" fill={COLORS.accentDark} />
      {/* Can */}
      <rect x="65" y="32" width="18" height="23" rx="3" fill={COLORS.primary} />
      <rect x="67" y="38" width="14" height="10" rx="2" fill={COLORS.white} opacity="0.3" />
      {/* Treats box */}
      <rect x="93" y="28" width="22" height="27" rx="3" fill={COLORS.greenLight} />
      <circle cx="104" cy="40" r="5" fill={COLORS.white} opacity="0.3" />
      {/* Bottle */}
      <rect x="125" y="35" width="12" height="20" rx="3" fill={COLORS.primaryLight} />
      <rect x="128" y="30" width="6" height="7" rx="2" fill={COLORS.primary} />
      {/* Small bag */}
      <rect x="147" y="30" width="20" height="25" rx="3" fill={COLORS.beige} />
      <rect x="150" y="32" width="14" height="5" rx="1" fill={COLORS.grayDark} />

      {/* Products on shelf 2 */}
      {/* Toy ball */}
      <circle cx="40" cy="95" r="12" fill={COLORS.accent} />
      <path d="M32 88 Q40 82 48 88" stroke={COLORS.white} strokeWidth="2" fill="none" opacity="0.4" />
      {/* Bone toy */}
      <g transform="translate(60, 85)">
        <rect x="5" y="5" width="20" height="8" rx="4" fill={COLORS.beigeLight} />
        <circle cx="5" cy="5" r="5" fill={COLORS.beige} />
        <circle cx="5" cy="13" r="5" fill={COLORS.beige} />
        <circle cx="25" cy="5" r="5" fill={COLORS.beige} />
        <circle cx="25" cy="13" r="5" fill={COLORS.beige} />
      </g>
      {/* Collar */}
      <path d="M100 95 Q115 85 130 95" stroke={COLORS.primary} strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="115" cy="88" r="3" fill={COLORS.primaryLight} />
      {/* Leash */}
      <path d="M140 90 L165 90 L165 100 L155 100 L155 95 L145 95" stroke={COLORS.grayDarker} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Happy cat at bottom */}
      <g transform="translate(75, 130)">
        <ellipse cx="25" cy="28" rx="18" ry="15" fill={COLORS.gray} />
        <circle cx="25" cy="15" r="13" fill={COLORS.gray} />
        <polygon points="15,8 10,-4 22,5" fill={COLORS.gray} />
        <polygon points="35,8 40,-4 28,5" fill={COLORS.gray} />
        <circle cx="20" cy="14" r="2.5" fill="#333" />
        <circle cx="30" cy="14" r="2.5" fill="#333" />
        <polygon points="25,18 23,20 27,20" fill="#ffb6b6" />
        <path d="M43 30 Q55 20 50 10" stroke={COLORS.gray} strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Store sign */}
      <rect x="65" y="2" width="70" height="16" rx="4" fill={COLORS.primary} />
      <text x="100" y="14" textAnchor="middle" fill={COLORS.white} fontSize="9" fontWeight="bold" fontFamily="sans-serif">PET SHOP</text>
    </svg>
  )
}
