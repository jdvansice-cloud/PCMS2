import { useParams, Link } from 'react-router-dom'
import { PawPrint, Calendar, FileText, Clock, ChevronRight, Heart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTenant } from '../../context/TenantContext'

export default function PortalDashboard() {
  const { slug } = useParams()
  const { authUser } = useAuth()
  const { company } = useTenant()
  const base = `/portal/${slug}`

  const customerName = authUser?.customerProfile?.first_name || 'Cliente'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="card p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <h1 className="text-xl font-display font-bold">Hola, {customerName}</h1>
        <p className="text-primary-100 text-sm mt-1">
          Bienvenido al portal de {company?.name || 'tu veterinaria'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <PawPrint size={22} />, label: 'Mascotas', value: '0', to: `${base}/pets`, color: 'text-emerald-600 bg-emerald-50' },
          { icon: <Calendar size={22} />, label: 'Proxima cita', value: 'Sin citas', to: `${base}/appointments`, color: 'text-blue-600 bg-blue-50' },
          { icon: <FileText size={22} />, label: 'Consultas', value: '0', to: `${base}/records`, color: 'text-purple-600 bg-purple-50' },
          { icon: <Heart size={22} />, label: 'Vacunas', value: 'Al dia', to: `${base}/records`, color: 'text-pink-600 bg-pink-50' },
        ].map(stat => (
          <Link key={stat.label} to={stat.to} className="card p-4 hover:shadow-soft transition-shadow group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <p className="text-xs text-slate-400">{stat.label}</p>
            <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-primary-500" /> Proximas Citas
            </h2>
            <Link to={`${base}/appointments`} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>
          <div className="text-center py-8 text-slate-400">
            <Calendar size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tienes citas programadas</p>
            <Link to={`${base}/appointments`}
              className="inline-block mt-3 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 font-medium">
              Agendar Cita
            </Link>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <PawPrint size={18} className="text-emerald-500" /> Mis Mascotas
            </h2>
            <Link to={`${base}/pets`} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>
          <div className="text-center py-8 text-slate-400">
            <PawPrint size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tienes mascotas registradas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
