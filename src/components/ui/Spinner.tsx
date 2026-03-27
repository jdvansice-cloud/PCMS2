const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
} as const

export interface SpinnerProps {
  size?: keyof typeof sizeClasses
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`${sizeClasses[size]} border-primary-500 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Cargando"
    />
  )
}

export function FullPageSpinner({ text }: { text?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <Spinner size="lg" />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  )
}
