import {
  Calendar,
  Users,
  PawPrint,
  DollarSign,
  Clock,
  Stethoscope,
  Scissors,
  AlertTriangle,
} from 'lucide-react'
import { useTenant } from '../context/TenantContext'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  bgColor: string
}

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center shrink-0`}>
          <div className={color}>{icon}</div>
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { company } = useTenant()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">
          Panel de Control
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Bienvenido a {company?.name || 'tu clinica'}. Aqui esta el resumen del dia.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar size={22} />}
          label="Citas hoy"
          value={0}
          color="text-primary-600"
          bgColor="bg-primary-50"
        />
        <StatCard
          icon={<Clock size={22} />}
          label="En espera"
          value={0}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={<PawPrint size={22} />}
          label="Pacientes"
          value={0}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon={<DollarSign size={22} />}
          label="Ventas hoy"
          value="$0.00"
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting Room */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users size={20} className="text-primary-500" />
              Sala de Espera
            </h2>
          </div>
          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <Users size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No hay pacientes en espera</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Acceso Rapido</h2>
          <div className="space-y-2">
            {[
              { icon: <Calendar size={18} />, label: 'Nueva Cita', color: 'text-primary-600 bg-primary-50' },
              { icon: <PawPrint size={18} />, label: 'Nuevo Paciente', color: 'text-emerald-600 bg-emerald-50' },
              { icon: <Stethoscope size={18} />, label: 'Nueva Consulta', color: 'text-blue-600 bg-blue-50' },
              { icon: <Scissors size={18} />, label: 'Estetica', color: 'text-purple-600 bg-purple-50' },
            ].map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-primary-500" />
            Citas del Dia
          </h2>
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-sm text-slate-500">No hay citas programadas para hoy</p>
          </div>
        </div>

        {/* Alerts */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-amber-500" />
            Alertas
          </h2>
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-sm text-slate-500">Sin alertas pendientes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
