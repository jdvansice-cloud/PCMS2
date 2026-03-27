export function formatCurrency(amount: number | null | undefined): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00'
  return `$${amount.toFixed(2)}`
}

export function formatDate(
  dateStr: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function formatTime(dateStr: string | Date): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDateTime(dateStr: string | Date): string {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`
}

export function formatRelativeTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays}d`
  return formatDate(dateStr)
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function formatWeight(weight: number | null | undefined): string {
  if (typeof weight !== 'number' || isNaN(weight)) return '0.00 kg'
  return `${weight.toFixed(2)} kg`
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncateText(text: string | null | undefined, maxLength = 50): string {
  if (!text || text.length <= maxLength) return text || ''
  return text.slice(0, maxLength) + '...'
}
