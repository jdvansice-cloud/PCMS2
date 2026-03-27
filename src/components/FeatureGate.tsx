import { Link } from 'react-router-dom'
import { Lock, ArrowRight, Sparkles } from 'lucide-react'
import { hasFeature, getRequiredPlan } from '../lib/features'
import { useTenant } from '../context/TenantContext'

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
  hideIfLocked?: boolean
}

const FEATURE_LABELS: Record<string, string> = {
  grooming: 'Estetica / Grooming',
  hospitalization: 'Hospitalizacion',
  laboratory: 'Laboratorio',
  preventive: 'Carnet Preventivo',
  loyalty: 'Programa de Lealtad',
  gift_cards: 'Tarjetas Regalo',
  reports: 'Reportes',
  portal: 'Portal del Cliente',
  communication: 'Comunicacion',
  multi_store: 'Multi-Sucursal',
  custom_branding: 'Marca Personalizada',
  api_access: 'Acceso API',
}

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export function FeatureGate({ feature, children, hideIfLocked = false }: FeatureGateProps) {
  const { plan, slug } = useTenant()
  const allowed = hasFeature(plan, feature)

  if (allowed) return <>{children}</>
  if (hideIfLocked) return null

  const requiredPlan = getRequiredPlan(feature)
  const featureLabel = FEATURE_LABELS[feature] || feature
  const planLabel = PLAN_LABELS[requiredPlan] || requiredPlan

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-sm text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-amber-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          {featureLabel}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Esta funcion esta disponible en el plan <strong className="text-slate-700">{planLabel}</strong>.
          Tu plan actual es <strong className="text-slate-700">{PLAN_LABELS[plan] || plan}</strong>.
        </p>
        <Link
          to={`/app/${slug}/settings`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <Sparkles size={16} />
          Mejorar plan
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
