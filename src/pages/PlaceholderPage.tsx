import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description?: string
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Construction size={28} className="text-slate-400" />
      </div>
      <h1 className="text-xl font-display font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-sm text-slate-500 max-w-md">
        {description || 'Este modulo esta en desarrollo. Pronto estara disponible.'}
      </p>
    </div>
  )
}
