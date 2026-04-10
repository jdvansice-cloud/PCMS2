// Cute sitting cat for sterilization section
import type { IllustrationProps } from './colors'
import { COLORS } from './colors'

export default function CatIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" fill="none">
      {/* Body */}
      <ellipse cx="60" cy="78" rx="28" ry="28" fill={COLORS.gray} />
      {/* Head */}
      <circle cx="60" cy="45" r="26" fill={COLORS.gray} />
      {/* Ears */}
      <polygon points="40,30 30,6 52,24" fill={COLORS.gray} />
      <polygon points="80,30 90,6 68,24" fill={COLORS.gray} />
      <polygon points="42,28 34,12 50,24" fill="#ffc0c0" />
      <polygon points="78,28 86,12 70,24" fill="#ffc0c0" />
      {/* Eyes */}
      <ellipse cx="48" cy="42" rx="5" ry="6" fill={COLORS.white} />
      <ellipse cx="72" cy="42" rx="5" ry="6" fill={COLORS.white} />
      <ellipse cx="48" cy="43" rx="3" ry="4.5" fill={COLORS.green} />
      <ellipse cx="72" cy="43" rx="3" ry="4.5" fill={COLORS.green} />
      <ellipse cx="48" cy="43" rx="1.5" ry="4" fill="#333" />
      <ellipse cx="72" cy="43" rx="1.5" ry="4" fill="#333" />
      <ellipse cx="49" cy="41" rx="1" ry="1.5" fill={COLORS.white} />
      <ellipse cx="73" cy="41" rx="1" ry="1.5" fill={COLORS.white} />
      {/* Nose */}
      <polygon points="60,52 57,55 63,55" fill="#ffb6b6" />
      {/* Mouth */}
      <path d="M57 55 Q60 60 63 55" stroke="#aaa" strokeWidth="1.2" fill="none" />
      {/* Whiskers */}
      <line x1="30" y1="48" x2="44" y2="50" stroke="#ccc" strokeWidth="1.2" />
      <line x1="28" y1="54" x2="44" y2="53" stroke="#ccc" strokeWidth="1.2" />
      <line x1="76" y1="50" x2="90" y2="48" stroke="#ccc" strokeWidth="1.2" />
      <line x1="76" y1="53" x2="92" y2="54" stroke="#ccc" strokeWidth="1.2" />
      {/* Collar with medical cross */}
      <rect x="40" y="65" width="40" height="6" rx="3" fill={COLORS.accent} />
      <rect x="57" y="71" width="6" height="6" rx="2" fill={COLORS.white} />
      <rect x="59" y="71.5" width="2" height="5" fill={COLORS.accent} />
      <rect x="57.5" y="73" width="5" height="2" fill={COLORS.accent} />
      {/* Front legs */}
      <rect x="40" y="95" width="10" height="18" rx="5" fill={COLORS.gray} />
      <rect x="68" y="95" width="10" height="18" rx="5" fill={COLORS.gray} />
      {/* Paws */}
      <ellipse cx="45" cy="114" rx="7" ry="3.5" fill={COLORS.white} />
      <ellipse cx="73" cy="114" rx="7" ry="3.5" fill={COLORS.white} />
      {/* Tail */}
      <path d="M88 80 Q105 65 100 45 Q98 38 92 42" stroke={COLORS.gray} strokeWidth="7" strokeLinecap="round" fill="none" />
    </svg>
  )
}
