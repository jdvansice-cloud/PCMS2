import type React from 'react'

const variantClasses = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700',
  ghost: 'hover:bg-slate-100 text-slate-600',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
} as const

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
} as const

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses
  size?: keyof typeof sizeClasses
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
