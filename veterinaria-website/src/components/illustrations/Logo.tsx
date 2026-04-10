export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Veterinaria Vida+"
    >
      {/* VETERINARIA text */}
      <text
        x="10"
        y="38"
        fill="white"
        fontFamily="Inter, Arial, sans-serif"
        fontWeight="800"
        fontSize="30"
        letterSpacing="3"
      >
        VETERINARIA
      </text>
      {/* Vida text */}
      <text
        x="10"
        y="100"
        fill="white"
        fontFamily="Inter, Arial, sans-serif"
        fontWeight="900"
        fontSize="72"
      >
        Vida
      </text>
      {/* Red cross + */}
      <g transform="translate(255, 50)">
        <rect x="18" y="0" width="24" height="60" rx="5" fill="#e74c3c" />
        <rect x="0" y="18" width="60" height="24" rx="5" fill="#e74c3c" />
      </g>
    </svg>
  )
}
